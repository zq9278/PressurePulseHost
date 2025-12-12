const isLinux = process.platform === 'linux';
let spi = null;

if (isLinux) {
  try {
    spi = require('spi-device');
  } catch (err) {
    console.warn('[WS2812] spi-device unavailable; LED control disabled', err?.message || err);
  }
} else {
  console.info('[WS2812] WS2812 control disabled on non-Linux platform:', process.platform);
}

// Encode a single byte for WS2812 when driven via SPI at ~2.4 MHz:
// - logical 1 => 110 (high-high-low)
// - logical 0 => 100 (high-low-low)
// 8 bits => 24 encoded bits => 3 bytes
const BIT_PATTERNS = [0b100, 0b110];
const BYTE_LUT = Array.from({ length: 256 }, (_v, idx) => {
  let bits24 = 0;
  for (let i = 7; i >= 0; i -= 1) {
    bits24 = (bits24 << 3) | BIT_PATTERNS[(idx >> i) & 0x01];
  }
  const buf = Buffer.allocUnsafe(3);
  buf[0] = (bits24 >> 16) & 0xff;
  buf[1] = (bits24 >> 8) & 0xff;
  buf[2] = bits24 & 0xff;
  return buf;
});

const DEFAULT_COLORS = {
  idle: [0, 0, 48], // soft blue
  running: [0, 72, 0], // green
  alert: [128, 96, 0], // yellow
  off: [0, 0, 0],
};

function clampByte(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(255, Math.round(v)));
}

function normalizeColor(color) {
  if (!Array.isArray(color) || color.length < 3) return DEFAULT_COLORS.off;
  return [clampByte(color[0]), clampByte(color[1]), clampByte(color[2])];
}

class Ws2812Driver {
  constructor(opts = {}) {
    this.ledCount = Number.isFinite(opts.ledCount) ? Number(opts.ledCount) : 51;
    this.busNumber = Number.isFinite(opts.busNumber) ? Number(opts.busNumber) : 0;
    this.deviceNumber = Number.isFinite(opts.deviceNumber) ? Number(opts.deviceNumber) : 0;
    this.speedHz = Number.isFinite(opts.speedHz) ? Number(opts.speedHz) : 2_400_000;
    this.resetBytes = Number.isFinite(opts.resetBytes) ? Number(opts.resetBytes) : 64;
    this.defaultColor = normalizeColor(opts.defaultColor || DEFAULT_COLORS.idle);
    this._device = null;
    this._ready = false;
    this._initPromise = null;
    this._flashTimer = null;
    this._flashEndTimer = null;
  }

  async init() {
    if (!spi) return false;
    if (this._ready) return true;
    if (this._initPromise) return this._initPromise;
    this._initPromise = new Promise((resolve) => {
      this._device = spi.open(
        this.busNumber,
        this.deviceNumber,
        {
          mode: 0,
          maxSpeedHz: this.speedHz,
          bitsPerWord: 8,
          // Keep defaults for chip select; WS2812 ignores CS anyway.
        },
        (err) => {
          if (err) {
            console.warn('[WS2812] failed to open SPI device', err.message || err);
            this._device = null;
            this._ready = false;
            resolve(false);
            return;
          }
          this._ready = true;
          resolve(true);
        }
      );
    });
    return this._initPromise;
  }

  async setSolidColor(color) {
    const ok = await this.init();
    if (!ok || !this._device) return false;
    this._clearFlashTimers();
    const normalized = normalizeColor(color);
    const payload = this._buildFrame(normalized);
    return this._transfer(payload);
  }

  async flashColor(color, durationMs = 2000, intervalMs = 250, fallbackColor = null) {
    const normalized = normalizeColor(color);
    const fallback = normalizeColor(fallbackColor || this.defaultColor || DEFAULT_COLORS.idle);
    const onBuf = this._buildFrame(normalized);
    const offBuf = this._buildFrame(DEFAULT_COLORS.off);
    const ok = await this.init();
    if (!ok || !this._device) return false;

    this._clearFlashTimers();
    const endAt = Date.now() + durationMs;
    let on = true;
    const tick = () => {
      if (Date.now() >= endAt) {
        this._transfer(this._buildFrame(fallback));
        this._clearFlashTimers();
        return;
      }
      this._transfer(on ? onBuf : offBuf);
      on = !on;
      this._flashTimer = setTimeout(tick, intervalMs);
    };
    tick();
    // Ensure we clean up if interval jitter pushes past duration.
    this._flashEndTimer = setTimeout(() => {
      this._clearFlashTimers();
      this._transfer(this._buildFrame(fallback));
    }, durationMs + intervalMs * 2);
    return true;
  }

  async showIdle() {
    return this.setSolidColor(this.defaultColor || DEFAULT_COLORS.idle);
  }

  async showRunning() {
    return this.setSolidColor(DEFAULT_COLORS.running);
  }

  async showStopAlert() {
    return this.flashColor(DEFAULT_COLORS.alert, 2000, 250, this.defaultColor);
  }

  _clearFlashTimers() {
    if (this._flashTimer) clearTimeout(this._flashTimer);
    if (this._flashEndTimer) clearTimeout(this._flashEndTimer);
    this._flashTimer = null;
    this._flashEndTimer = null;
  }

  _buildFrame(rgb) {
    const colors = normalizeColor(rgb);
    const totalLen = this.ledCount * 9 + this.resetBytes;
    const buf = Buffer.alloc(totalLen, 0);
    let offset = 0;
    // WS2812 expects GRB byte order
    const gEnc = BYTE_LUT[colors[1]];
    const rEnc = BYTE_LUT[colors[0]];
    const bEnc = BYTE_LUT[colors[2]];
    for (let i = 0; i < this.ledCount; i += 1) {
      gEnc.copy(buf, offset);
      rEnc.copy(buf, offset + 3);
      bEnc.copy(buf, offset + 6);
      offset += 9;
    }
    // Trailing zeros (reset pulse) already filled by Buffer.alloc
    return buf;
  }

  _transfer(sendBuffer) {
    if (!spi || !this._device || !this._ready) return false;
    return new Promise((resolve) => {
      this._device.transfer(
        [
          {
            sendBuffer,
            receiveBuffer: Buffer.alloc(sendBuffer.length),
            byteLength: sendBuffer.length,
            speedHz: this.speedHz,
            bitsPerWord: 8,
          },
        ],
        (err) => {
          if (err) {
            console.warn('[WS2812] SPI transfer failed', err.message || err);
            resolve(false);
            return;
          }
          resolve(true);
        }
      );
    });
  }
}

module.exports = {
  Ws2812Driver,
  DEFAULT_COLORS,
};
