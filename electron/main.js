// ============ Electron 主进程 ============
// 强制 Electron 使用 Wayland（Ozone）模式
// ① 必须先拿到 app 对象，再设置 GPU 开关
const { app, BrowserWindow, ipcMain } = require('electron');

// Disable GPU on Linux to avoid crashes when GLES drivers cannot be loaded; keep GPU on Windows for smoother UI
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
}

// ===== GPU / display ?? =====
const useWayland =
  process.env.ELECTRON_USE_WAYLAND === '1' || process.env.XDG_SESSION_TYPE === 'wayland';
if (useWayland) {
  app.commandLine.appendSwitch('ozone-platform', 'wayland');
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
  app.commandLine.appendSwitch('use-gl', 'egl');
} else {
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
}
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
// Kiosk UX: allow playing prompt sounds without requiring a prior user gesture.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// =======================================================
const fs = require('fs');
const path = require('path');
const os = require('os');
const { pathToFileURL } = require('url');
const { spawn } = require('child_process');
const { SerialManager } = require('./serial');
const proto = require('./protocol');
const { Ws2812Driver, DEFAULT_COLORS } = require('./ws2812');

const IS_LINUX = process.platform === 'linux';
const ALSA_CARD = String(process.env.PPHC_ALSA_CARD || process.env.ALSA_CARD || '0');
const ALSA_CARD_ARGS = ALSA_CARD ? ['-c', ALSA_CARD] : [];
const ALSA_DEVICE = String(process.env.PPHC_ALSA_DEVICE || process.env.ALSA_DEVICE || '').trim();
const AUDIO_PLAYER = String(process.env.PPHC_AUDIO_PLAYER || '').trim();
const AUDIO_GAIN = Number.parseFloat(process.env.PPHC_AUDIO_GAIN || '1');
const AUDIO_FORCE_STEREO = String(process.env.PPHC_AUDIO_FORCE_STEREO || '1').trim().toLowerCase();
const DISABLE_APLAY =
  String(process.env.PPHC_DISABLE_APLAY || '').trim() === '1' || AUDIO_PLAYER === 'renderer';

const LED_COUNT = Number.parseInt(process.env.PPHC_LED_COUNT, 10);
const SPI_BUS = Number.parseInt(process.env.PPHC_SPI_BUS, 10);
const SPI_DEVICE = Number.parseInt(process.env.PPHC_SPI_DEVICE, 10);
const SPI_SPEED_HZ = Number.parseInt(process.env.PPHC_SPI_SPEED_HZ, 10);

// Preemptively turn off backlight before Electron window creation to avoid white flash (Linux only)
if (IS_LINUX) {
  try {
    fs.writeFileSync('/sys/class/backlight/backlight2/brightness', '0');
  } catch (err) {
    console.warn('[PPHC] pre-start backlight off failed', err?.message || err);
  }
}

const expandPath = (p) => {
  if (!p) return p;
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
};

let mainWindow;
const serial = new SerialManager();
const leds = IS_LINUX
  ? new Ws2812Driver({
      ledCount: Number.isFinite(LED_COUNT) ? LED_COUNT : 51,
      busNumber: Number.isFinite(SPI_BUS) ? SPI_BUS : 0,
      deviceNumber: Number.isFinite(SPI_DEVICE) ? SPI_DEVICE : 0,
      speedHz: Number.isFinite(SPI_SPEED_HZ) ? SPI_SPEED_HZ : 2_400_000,
      defaultColor: DEFAULT_COLORS.idle,
    })
  : null;

const BRIGHTNESS_PATH = IS_LINUX ? '/sys/class/backlight/backlight2/brightness' : null;
const MAX_BRIGHTNESS_PATH = IS_LINUX ? '/sys/class/backlight/backlight2/max_brightness' : null;
const DEFAULT_MAX_BRIGHTNESS = 255;
const MIN_BRIGHTNESS = 15;
let DATA_BASE_DIR;
let LEGACY_BASE_DIR;
let SETTINGS_PATH;
let LEGACY_SETTINGS_PATH;
let PATIENTS_DIR;
let PATIENTS_FILE;
let LEGACY_PATIENTS_FILE;
let LOGS_DIR;
let REPORTS_DIR;
let UPDATES_FILE;

function initStoragePaths() {
  const dataBase = expandPath(process.env.PPHC_DATA_DIR) || app.getPath('userData');
  const legacyBase = app.isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');

  DATA_BASE_DIR = dataBase;
  LEGACY_BASE_DIR = legacyBase;

  SETTINGS_PATH = path.join(dataBase, 'settings.json');
  LEGACY_SETTINGS_PATH = path.join(legacyBase, 'settings.json');

  PATIENTS_DIR = path.join(legacyBase, 'patients');
  PATIENTS_FILE = path.join(PATIENTS_DIR, 'patients.json');
  LEGACY_PATIENTS_FILE = path.join(dataBase, 'patients', 'patients.json');

  LOGS_DIR = path.join(dataBase, 'logs');
  REPORTS_DIR = path.join(legacyBase, 'reports');

  // Updates manifest is a read-only bundle artifact, keep it next to the app in legacy base
  UPDATES_FILE = path.join(legacyBase, 'updates', 'latest.json');
}
let currentLogFile = null;
let logStream = null;
const STARTUP_SPEECH = {
  zh: '设备已启动，请连接治疗仪。',
  en: 'System is ready. Please connect the device.',
};
const DEFAULT_SETTINGS = {
  brightness: 80,
  volume: 100,
  playChime: true,
  pressureAlertSound: true,
  printerName: '',
  language: 'zh',
  theme: 'dark',
  fontScale: 1,
  autoConnect: true,
  lastCalibrationAt: null,
  accounts: [{ username: 'admin', password: 'admin', role: 'admin' }],
};
let currentSettings = { ...DEFAULT_SETTINGS };
let settingsFresh = true;

function clampFontScale(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return 1;
  return Math.max(0.8, Math.min(1.3, raw));
}

async function readNumber(filePath) {
  if (!IS_LINUX || !filePath) throw new Error('unsupported platform');
  const raw = await fs.promises.readFile(filePath, 'utf8');
  const num = Number.parseInt(String(raw).trim(), 10);
  if (Number.isNaN(num)) throw new Error(`Invalid numeric content from ${filePath}`);
  return num;
}

async function resolveMaxBrightness() {
  if (!IS_LINUX || !MAX_BRIGHTNESS_PATH) return DEFAULT_MAX_BRIGHTNESS;
  try {
    return await readNumber(MAX_BRIGHTNESS_PATH);
  } catch (err) {
    console.warn('[PPHC] max brightness fallback ->', DEFAULT_MAX_BRIGHTNESS, err.message);
    return DEFAULT_MAX_BRIGHTNESS;
  }
}

async function getBrightnessPercent() {
  if (!IS_LINUX || !BRIGHTNESS_PATH) {
    const percent = Number.isFinite(currentSettings.brightness)
      ? Math.max(MIN_BRIGHTNESS, Math.min(100, currentSettings.brightness))
      : 80;
    return { raw: 0, max: DEFAULT_MAX_BRIGHTNESS, percent };
  }
  const max = await resolveMaxBrightness();
  const raw = await readNumber(BRIGHTNESS_PATH);
  const percent = Math.round((raw / max) * 100);
  return {
    raw,
    max,
    percent: Math.max(MIN_BRIGHTNESS, Math.min(100, percent)),
  };
}

function clampBrightnessPercent(percent, opts = {}) {
  const pctRaw = Number(percent);
  if (!Number.isFinite(pctRaw)) return opts.allowZero ? 0 : MIN_BRIGHTNESS;
  const min = opts.allowZero ? 0 : MIN_BRIGHTNESS;
  return Math.max(min, Math.min(100, pctRaw));
}

async function setBrightnessPercent(percent, opts = {}) {
  if (!IS_LINUX || !BRIGHTNESS_PATH) {
    const pct = clampBrightnessPercent(percent, opts);
    if (!opts.skipSave) {
      currentSettings.brightness = pct;
      saveSettings().catch(() => {});
    }
    return { raw: 0, max: DEFAULT_MAX_BRIGHTNESS, percent: pct };
  }
  const max = await resolveMaxBrightness();
  const pct = clampBrightnessPercent(percent, opts);
  const raw = Math.round((pct / 100) * max);
  await fs.promises.writeFile(BRIGHTNESS_PATH, String(raw));
  if (!opts.skipSave) {
    currentSettings.brightness = pct;
    saveSettings().catch(() => {});
  }
  return { raw, max, percent: pct };
}

function ledShowIdle() {
  if (!leds) return;
  leds
    .showIdle()
    .then((ok) => {
      if (!ok) console.warn('[PPHC] ws2812 showIdle failed');
    })
    .catch((err) => console.warn('[PPHC] ws2812 showIdle error', err?.message || err));
}

function ledShowRunning() {
  if (!leds) return;
  leds
    .showRunning()
    .then((ok) => {
      if (!ok) console.warn('[PPHC] ws2812 showRunning failed');
    })
    .catch((err) => console.warn('[PPHC] ws2812 showRunning error', err?.message || err));
}

function ledShowStopAlert() {
  if (!leds) return;
  leds
    .showStopAlert()
    .then((ok) => {
      if (!ok) console.warn('[PPHC] ws2812 showStopAlert failed');
    })
    .catch((err) => console.warn('[PPHC] ws2812 showStopAlert error', err?.message || err));
}

function loadSettings() {
  const candidates = [SETTINGS_PATH, LEGACY_SETTINGS_PATH].filter(
    (p, idx, arr) => p && arr.indexOf(p) === idx,
  );
  let loadedFrom = null;
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
      settingsFresh = false;
      loadedFrom = filePath;
      break;
    } catch {}
  }
  if (!loadedFrom) {
    currentSettings = { ...DEFAULT_SETTINGS };
    settingsFresh = true;
  }
  if (!Array.isArray(currentSettings.accounts)) currentSettings.accounts = [];
  currentSettings.accounts = currentSettings.accounts
    .map((a) => ({
      username: String(a?.username || '').trim(),
      password: String(a?.password || ''),
      role: String(a?.role || 'user') || 'user',
    }))
    .filter((a) => a.username);
  let adminUpdated = false;
  const adminIndex = currentSettings.accounts.findIndex((a) => a.username.toLowerCase() === 'admin');
  if (adminIndex === -1) {
    currentSettings.accounts.unshift({ username: 'admin', password: 'admin', role: 'admin' });
    adminUpdated = true;
  } else {
    const admin = currentSettings.accounts[adminIndex];
    const nextAdmin = {
      username: 'admin',
      password: admin.password || 'admin',
      role: 'admin',
    };
    if (
      admin.username !== nextAdmin.username ||
      admin.role !== nextAdmin.role ||
      admin.password !== nextAdmin.password
    ) {
      currentSettings.accounts[adminIndex] = nextAdmin;
      adminUpdated = true;
    }
  }
  currentSettings.language = currentSettings.language === 'en' ? 'en' : 'zh';
  currentSettings.theme = currentSettings.theme === 'light' ? 'light' : 'dark';
  currentSettings.fontScale = clampFontScale(currentSettings.fontScale);
  currentSettings.autoConnect = currentSettings.autoConnect !== false;
  currentSettings.lastCalibrationAt =
    typeof currentSettings.lastCalibrationAt === 'string' && currentSettings.lastCalibrationAt
      ? currentSettings.lastCalibrationAt
      : null;
  if (adminUpdated) {
    saveSettings().catch(() => {});
  } else if (loadedFrom === LEGACY_SETTINGS_PATH && SETTINGS_PATH && SETTINGS_PATH !== LEGACY_SETTINGS_PATH) {
    saveSettings().catch(() => {});
  }
}

async function saveSettings() {
  try {
    if (!SETTINGS_PATH) return;
    await fs.promises.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(currentSettings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[PPHC] save settings failed', err?.message || err);
  }
}

function getAppSettings() {
  return {
    language: currentSettings.language === 'en' ? 'en' : 'zh',
    theme: currentSettings.theme === 'light' ? 'light' : 'dark',
    fontScale: clampFontScale(currentSettings.fontScale),
    autoConnect: currentSettings.autoConnect !== false,
    lastCalibrationAt: currentSettings.lastCalibrationAt || null,
  };
}

async function updateAppSettings(patch = {}) {
  if (!patch || typeof patch !== 'object') return getAppSettings();
  if (typeof patch.language === 'string') {
    currentSettings.language = patch.language === 'en' ? 'en' : 'zh';
  }
  if (typeof patch.theme === 'string') {
    currentSettings.theme = patch.theme === 'light' ? 'light' : 'dark';
  }
  if (patch.fontScale != null) {
    currentSettings.fontScale = clampFontScale(patch.fontScale);
  }
  if (typeof patch.autoConnect === 'boolean') {
    currentSettings.autoConnect = patch.autoConnect;
  }
  if (patch.lastCalibrationAt === null) {
    currentSettings.lastCalibrationAt = null;
  } else if (typeof patch.lastCalibrationAt === 'string') {
    currentSettings.lastCalibrationAt = patch.lastCalibrationAt.trim() || null;
  }
  await saveSettings();
  return getAppSettings();
}

async function setVolumePercent(percent) {
  if (!IS_LINUX) {
    const pctRaw = Number(percent) || 0;
    const pctClamped = Math.max(0, Math.min(100, pctRaw));
    currentSettings.volume = pctClamped;
    saveSettings().catch(() => {});
    return { percent: pctClamped, applied: null };
  }
  const pctRaw = Number(percent) || 0;
  const pctClamped = Math.max(0, Math.min(100, pctRaw));
  let target = 0;
  if (pctClamped > 0) {
    await ensureAudioOutputsOn().catch(() => {});
    target = 80 + (pctClamped / 100) * 20; // map 1-100 -> 80-100
  }
  const args = [...ALSA_CARD_ARGS, 'set', 'PCM', `${Math.round(target)}%`];
  if (pctClamped === 0) args.push('mute');
  else args.push('unmute');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn('amixer', args, { stdio: 'ignore' });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`amixer exit ${code}`));
      });
    });
    currentSettings.volume = pctClamped;
    saveSettings().catch(() => {});
    return { percent: pctClamped, applied: Math.round(target) };
  } catch (err) {
    console.warn('[PPHC] set volume failed', err?.message || err);
    return { percent: pctClamped, applied: null, error: err?.message || String(err) };
  }
}

function runAmixer(args) {
  if (!IS_LINUX) return Promise.resolve(true);
  return new Promise((resolve, reject) => {
    const child = spawn('amixer', args, { stdio: 'ignore' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`amixer exit ${code}`));
    });
  });
}

async function ensureAudioOutputsOn() {
  if (!IS_LINUX) return;
  const tasks = [
    [...ALSA_CARD_ARGS, 'set', 'Speaker', 'on'],
    [...ALSA_CARD_ARGS, 'set', 'Headphone', 'on'],
    [...ALSA_CARD_ARGS, 'set', 'spk switch', 'on'],
    [...ALSA_CARD_ARGS, 'set', 'hp switch', 'on'],
    [...ALSA_CARD_ARGS, 'set', 'OUT1', 'on'],
    [...ALSA_CARD_ARGS, 'set', 'OUT2', 'on'],
    [...ALSA_CARD_ARGS, 'set', 'Output 1', '100%'],
    [...ALSA_CARD_ARGS, 'set', 'Output 2', '100%'],
    [...ALSA_CARD_ARGS, 'set', 'PCM', '100%'],
  ];
  for (const args of tasks) {
    try {
      await runAmixer(args);
    } catch (err) {
      console.warn('[PPHC] amixer init failed', args.join(' '), err?.message || err);
    }
  }
}

async function ensureAudioOutputsOff() {
  if (!IS_LINUX) return;
  const tasks = [
    [...ALSA_CARD_ARGS, 'set', 'Speaker', 'off'],
    [...ALSA_CARD_ARGS, 'set', 'Headphone', 'off'],
    [...ALSA_CARD_ARGS, 'set', 'spk switch', 'off'],
    [...ALSA_CARD_ARGS, 'set', 'hp switch', 'off'],
    [...ALSA_CARD_ARGS, 'set', 'OUT1', 'off'],
    [...ALSA_CARD_ARGS, 'set', 'OUT2', 'off'],
    [...ALSA_CARD_ARGS, 'set', 'PCM', '0%', 'mute'],
  ];
  for (const args of tasks) {
    try {
      await runAmixer(args);
    } catch (err) {
      console.warn('[PPHC] amixer off failed', args.join(' '), err?.message || err);
    }
  }
}

function loadPatients() {
  const candidates = [PATIENTS_FILE, LEGACY_PATIENTS_FILE].filter(
    (p, idx, arr) => p && arr.indexOf(p) === idx,
  );
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      if (filePath === LEGACY_PATIENTS_FILE && PATIENTS_FILE && PATIENTS_FILE !== LEGACY_PATIENTS_FILE) {
        savePatients(parsed).catch(() => {});
      }
      return parsed;
    } catch {}
  }
  return [];
}

async function savePatients(list) {
  try {
    if (!PATIENTS_DIR || !PATIENTS_FILE) return false;
    await fs.promises.mkdir(PATIENTS_DIR, { recursive: true });
    await fs.promises.writeFile(PATIENTS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[PPHC] save patients failed', err?.message || err);
    return false;
  }
}

async function removePatientById(id) {
  const target = String(id || '').trim();
  if (!target) return { success: false, failureReason: 'missing id' };
  const list = loadPatients();
  const next = list.filter((p) => String(p?.id || '').trim() !== target);
  const changed = next.length !== list.length;
  if (!changed) return { success: false, failureReason: 'not found' };
  const saved = await savePatients(next);
  return saved ? { success: true } : { success: false, failureReason: 'save failed' };
}

async function updatePatientById(id, patch = {}) {
  const target = String(id || '').trim();
  if (!target) throw new Error('missing id');
  const list = loadPatients();
  let updated = null;
  const now = new Date().toISOString();
  const next = list.map((p) => {
    if (String(p?.id || '').trim() !== target) return p;
    updated = { ...p, ...patch, id: p.id, updatedAt: now };
    return updated;
  });
  if (!updated) throw new Error('not found');
  const saved = await savePatients(next);
  if (!saved) throw new Error('save failed');
  return updated;
}

async function restorePatients(entries = []) {
  const list = loadPatients();
  const existing = new Set(list.map((p) => String(p?.id || '').trim()).filter(Boolean));
  const now = new Date().toISOString();
  const restored = [];
  const input = Array.isArray(entries) ? entries : [entries];
  for (const item of input) {
    const id = String(item?.id || '').trim();
    if (!id || existing.has(id)) continue;
    const createdAt = String(item?.createdAt || now);
    const updatedAt = String(item?.updatedAt || createdAt || now);
    restored.push({
      id,
      name: String(item?.name || '').trim(),
      gender: item?.gender === '濂?' || item?.gender === 'female' ? '濂?' : '鐢?',
      phone: String(item?.phone || '').trim(),
      birth: String(item?.birth || '').trim(),
      notes: String(item?.notes || '').trim(),
      therapist: String(item?.therapist || '').trim(),
      deviceModel: String(item?.deviceModel || '').trim(),
      status: String(item?.status || 'active') || 'active',
      photoData: item?.photoData || null,
      lastTreatment: item?.lastTreatment || null,
      lastParams: item?.lastParams || null,
      curveSnapshot: item?.curveSnapshot || null,
      createdAt,
      updatedAt,
    });
    existing.add(id);
  }
  if (!restored.length) return { success: false, failureReason: 'no valid entries' };
  const saved = await savePatients([...list, ...restored]);
  return saved
    ? { success: true, restored: restored.map((p) => p.id) }
    : { success: false, failureReason: 'save failed' };
}

async function clearAllPatients() {
  const saved = await savePatients([]);
  return saved ? { success: true } : { success: false, failureReason: 'save failed' };
}

function nextPatientId(existing = []) {
  const nums = existing
    .map((p) => String(p?.id || ''))
    .map((id) => {
      const m = id.match(/(\d+)/);
      return m ? Number(m[1]) : NaN;
    })
    .filter((n) => Number.isFinite(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `P${String(next).padStart(4, '0')}`;
}

function normalizePatientIdInput(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const compact = text.replace(/\s+/g, '');
  if (/^\d+$/.test(compact)) return `P${compact.padStart(4, '0')}`;
  return compact.toUpperCase();
}

async function applyChimeSetting() {
  if (!IS_LINUX) return;
  if (currentSettings.playChime) {
    await ensureAudioOutputsOn().catch(() => {});
  }
}

let spokeOnce = false;
function speakStartup() {
  // TTS disabled; using pre-recorded audio in renderer.
  return;
}

function findExecutable(bin) {
  const paths = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  for (const dir of paths) {
    const full = path.join(dir, bin);
    try {
      fs.accessSync(full, fs.constants.X_OK);
      return full;
    } catch {}
  }
  return null;
}

let audioQueue = Promise.resolve();
let aplayDisabledUntil = 0;
let lastAplayLogAt = 0;
function enqueueAudioPlay(task) {
  const next = audioQueue.then(task, task);
  audioQueue = next.catch(() => {});
  return next;
}

const audioTransformCache = new Map();
async function transformWavForPlayback(filePath) {
  const gainRaw = Number.isFinite(AUDIO_GAIN) ? AUDIO_GAIN : 1;
  const gain = Math.min(10, Math.max(0, gainRaw));
  const forceStereo = !(AUDIO_FORCE_STEREO === '0' || AUDIO_FORCE_STEREO === 'false');
  if (gain <= 1 && !forceStereo) return filePath;
  const key = `${filePath}|${gain}|${forceStereo ? 'stereo' : 'keep'}`;
  const cached = audioTransformCache.get(key);
  if (cached && fs.existsSync(cached)) return cached;

  let buf;
  try {
    buf = await fs.promises.readFile(filePath);
  } catch {
    return filePath;
  }
  if (buf.length < 44) return filePath;
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    return filePath;
  }

  let offset = 12;
  let audioFormat = null;
  let bitsPerSample = null;
  let numChannels = null;
  let sampleRate = null;
  let dataOffset = null;
  let dataSize = null;
  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === 'fmt ') {
      audioFormat = buf.readUInt16LE(chunkStart);
      numChannels = buf.readUInt16LE(chunkStart + 2);
      sampleRate = buf.readUInt32LE(chunkStart + 4);
      bitsPerSample = buf.readUInt16LE(chunkStart + 14);
    } else if (chunkId === 'data') {
      dataOffset = chunkStart;
      dataSize = chunkSize;
      break;
    }
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }
  if (
    audioFormat !== 1 ||
    bitsPerSample !== 16 ||
    !Number.isFinite(numChannels) ||
    !Number.isFinite(sampleRate) ||
    dataOffset === null ||
    dataSize === null
  ) {
    return filePath;
  }
  if (dataOffset + dataSize > buf.length) return filePath;

  const inputData = buf.slice(dataOffset, dataOffset + dataSize);
  const needsStereo = forceStereo && numChannels === 1;
  const outChannels = needsStereo ? 2 : numChannels;
  const outDataSize = needsStereo ? dataSize * 2 : dataSize;
  const outData = Buffer.allocUnsafe(outDataSize);
  const clamp = (v) => {
    if (v > 32767) return 32767;
    if (v < -32768) return -32768;
    return v;
  };
  if (needsStereo) {
    let outIdx = 0;
    for (let i = 0; i + 1 < inputData.length; i += 2) {
      const s = inputData.readInt16LE(i);
      const v = clamp(Math.round(s * gain));
      outData.writeInt16LE(v, outIdx);
      outData.writeInt16LE(v, outIdx + 2);
      outIdx += 4;
    }
  } else if (gain > 1) {
    for (let i = 0; i + 1 < inputData.length; i += 2) {
      const s = inputData.readInt16LE(i);
      const v = clamp(Math.round(s * gain));
      outData.writeInt16LE(v, i);
    }
  } else {
    inputData.copy(outData);
  }

  const cacheDir = path.join(os.tmpdir(), 'pphc-audio');
  const gainLabel = String(gain).replace(/[^0-9A-Za-z_.-]/g, '') || '1';
  const base = path.basename(filePath, path.extname(filePath));
  const stereoLabel = needsStereo ? '-stereo' : '';
  const outPath = path.join(cacheDir, `${base}-gain${gainLabel}${stereoLabel}.wav`);
  try {
    await fs.promises.mkdir(cacheDir, { recursive: true });
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + outData.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(outChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    const blockAlign = (outChannels * bitsPerSample) / 8;
    header.writeUInt32LE(sampleRate * blockAlign, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(outData.length, 40);
    await fs.promises.writeFile(outPath, Buffer.concat([header, outData]));
    audioTransformCache.set(key, outPath);
    return outPath;
  } catch {
    return filePath;
  }
}

function getAplayDeviceCandidates() {
  const devices = [];
  if (ALSA_DEVICE) devices.push(ALSA_DEVICE);
  devices.push('default');
  if (IS_LINUX) {
    const card = String(ALSA_CARD || '').trim();
    if (card) {
      devices.push(`dmix:CARD=${card},DEV=0`);
      devices.push(`plughw:CARD=${card},DEV=0`);
      devices.push(`hw:CARD=${card},DEV=0`);
    }
  }
  return [...new Set(devices.filter(Boolean))];
}

function shouldLogAplayError() {
  const now = Date.now();
  if (now - lastAplayLogAt > 5000) {
    lastAplayLogAt = now;
    return true;
  }
  return false;
}

function spawnAplay(args) {
  return new Promise((resolve) => {
    const child = spawn('aplay', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    child.stderr?.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', (err) => {
      done({ ok: false, error: err?.message || String(err), fatal: err?.code === 'ENOENT' });
    });
    child.on('close', (code) => {
      const trimmed = stderr.trim();
      if (code !== 0 && trimmed && shouldLogAplayError()) {
        console.warn('[PPHC] aplay stderr', trimmed);
      }
      done({ ok: code === 0, code, stderr: trimmed });
    });
  });
}

function isBusyError(result) {
  const text = [result?.error, result?.stderr].filter(Boolean).join(' ');
  if (!text) return false;
  const lowered = text.toLowerCase();
  return (
    lowered.includes('resource busy') ||
    lowered.includes('device busy') ||
    lowered.includes('ebusy') ||
    text.includes('设备或资源忙')
  );
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAplayDisabled() {
  return aplayDisabledUntil && Date.now() < aplayDisabledUntil;
}

function spawnPwPlay(filePath) {
  return new Promise((resolve) => {
    const bin = findExecutable('pw-play');
    if (!bin) {
      resolve({ ok: false, error: 'pw-play not found', fatal: true });
      return;
    }
    const child = spawn(bin, [filePath], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    child.stderr?.on('data', (d) => {
      const text = d.toString();
      stderr += text;
      console.warn('[PPHC] pw-play stderr', text.trim());
    });
    child.on('error', (err) => {
      done({ ok: false, error: err?.message || String(err) });
    });
    child.on('close', (code) => {
      done({ ok: code === 0, code, stderr: stderr.trim() });
    });
  });
}

function playWav(filePath, player, sox, aplayArgs) {
  let wavForPlay = filePath;
  const cleanup = [];
  const doPlay = () => {
    if (player) {
      const args = ['-q', ...aplayArgs, wavForPlay];
      const play = spawn(player, args, { stdio: ['ignore', 'ignore', 'pipe'] });
      play.stderr?.on('data', (d) => console.warn('[PPHC] aplay stderr', d.toString().trim()));
      play.on('error', (err) => console.warn('[PPHC] aplay failed', err?.message || err));
      play.on('close', (code) => {
        if (code !== 0) console.warn('[PPHC] aplay exited with code', code);
        fs.promises.unlink(filePath).catch(() => {});
        cleanup.forEach((f) => fs.promises.unlink(f).catch(() => {}));
      });
      return;
    }
    console.warn('[PPHC] no aplay found, cannot play wav');
  };

  if (sox) {
    const converted = filePath.replace(/\.wav$/i, '-48k.wav');
    const soxArgs = [filePath, '-r', '48000', '-c', '2', converted];
    const resample = spawn(sox, soxArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
    resample.stderr?.on('data', (d) => console.warn('[PPHC] sox stderr', d.toString().trim()));
    resample.on('close', (code) => {
      if (code === 0) {
        wavForPlay = converted;
        cleanup.push(converted);
      } else {
        console.warn('[PPHC] sox exited with code', code);
      }
      doPlay();
    });
    resample.on('error', (err) => {
      console.warn('[PPHC] sox failed', err?.message || err);
      doPlay();
    });
  } else {
    doPlay();
  }
}

function resolveResourcePath(relPath) {
  const safeRel = String(relPath || '').replace(/^[/\\]+/, '');
  if (!safeRel) return null;
  if (app.isPackaged) {
    const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked', safeRel);
    if (fs.existsSync(unpacked)) return unpacked;
  }
  const devPath = path.join(__dirname, '..', safeRel);
  if (fs.existsSync(devPath)) return devPath;
  return null;
}

async function playPromptSound(key) {
  const map = {
    shield: 'resoure/shield-is-invalid.wav',
    start: 'resoure/Treatment-start.wav',
    stop: 'resoure/Treatment-stop.wav',
    tempHigh: 'resoure/Temperature-high.wav',
    pressureHigh: 'resoure/pressure_woring.wav',
  };
  const rel = map[String(key || '').trim()] || null;
  const full = rel ? resolveResourcePath(rel) : null;
  if (!full) return { ok: false, error: 'missing audio file' };

  return enqueueAudioPlay(async () => {
    if (IS_LINUX) {
      await ensureAudioOutputsOn().catch(() => {});
    }
    const playable = await transformWavForPlayback(full);
    const preferPwPlay = IS_LINUX && AUDIO_PLAYER === 'pw-play';
    if (preferPwPlay) {
      const result = await spawnPwPlay(playable);
      if (result.ok) return { ok: true, player: 'pw-play' };
    }
    if (DISABLE_APLAY || isAplayDisabled()) {
      return { ok: false, error: 'aplay disabled' };
    }
    const devices = getAplayDeviceCandidates();
    let lastResult = null;
    for (const device of devices) {
      const args = ['-q', '-D', device, playable];
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await spawnAplay(args);
        if (result.ok) return { ok: true, device };
        lastResult = result;
        if (result.fatal) return { ok: false, error: result.error || 'aplay failed' };
        if (!isBusyError(result)) break;
        aplayDisabledUntil = Date.now() + 60000;
        await waitMs(200);
      }
      if (isBusyError(lastResult)) break;
    }
    return {
      ok: false,
      error: lastResult?.error || lastResult?.stderr || 'aplay failed',
      code: lastResult?.code,
    };
  });
}

function safeToString(val) {
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

function appendLogLine(source, level, args) {
  if (!logStream) return;
  const ts = new Date().toISOString();
  const msg = (args || []).map(safeToString).join(' ');
  try {
    logStream.write(`[${ts}] [${source}] [${level}] ${msg}\n`);
  } catch {}
}

function initLogging() {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  } catch {}
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  currentLogFile = path.join(LOGS_DIR, `${stamp}.log`);
  try {
    logStream = fs.createWriteStream(currentLogFile, { flags: 'a' });
  } catch {}

  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  console.log = (...args) => {
    original.log(...args);
    appendLogLine('main', 'log', args);
  };
  console.info = (...args) => {
    original.info(...args);
    appendLogLine('main', 'info', args);
  };
  console.warn = (...args) => {
    original.warn(...args);
    appendLogLine('main', 'warn', args);
  };
  console.error = (...args) => {
    original.error(...args);
    appendLogLine('main', 'error', args);
  };

  process.on('uncaughtException', (err) => {
    appendLogLine('process', 'error', [err?.stack || err?.message || safeToString(err)]);
  });
  process.on('unhandledRejection', (reason) => {
    appendLogLine('process', 'error', [reason?.stack || reason?.message || safeToString(reason)]);
  });
}

async function listLogFiles() {
  try {
    await fs.promises.mkdir(LOGS_DIR, { recursive: true });
    const files = await fs.promises.readdir(LOGS_DIR);
    const logs = [];
    for (const name of files) {
      if (!name.endsWith('.log')) continue;
      try {
        const st = await fs.promises.stat(path.join(LOGS_DIR, name));
        logs.push({ name, size: st.size, mtimeMs: st.mtimeMs });
      } catch {}
    }
    logs.sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0));
    return logs;
  } catch (err) {
    console.warn('[PPHC] list logs failed', err?.message || err);
    return [];
  }
}

async function readLogFile(name) {
  const safeName = String(name || '').replace(/[\\/]/g, '');
  const full = path.join(LOGS_DIR, safeName);
  if (!full.startsWith(LOGS_DIR)) throw new Error('invalid log path');
  return fs.promises.readFile(full, 'utf8');
}

function compareVersions(a, b) {
  const pa = String(a || '').split('.').map((n) => Number.parseInt(n, 10) || 0);
  const pb = String(b || '').split('.').map((n) => Number.parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

async function checkForUpdates() {
  const currentVersion = app.getVersion();
  try {
    const raw = await fs.promises.readFile(UPDATES_FILE, 'utf8');
    const manifest = JSON.parse(raw || '{}');
    const latestVersion = String(manifest.version || '').trim();
    if (!latestVersion) {
      return { currentVersion, latestVersion: null, updateAvailable: false };
    }
    const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;
    return {
      currentVersion,
      latestVersion,
      updateAvailable,
      downloadUrl: manifest.downloadUrl || manifest.url || null,
      notes: manifest.notes || '',
    };
  } catch {
    return { currentVersion, latestVersion: null, updateAvailable: false };
  }
}

async function listPrinters() {
  if (!mainWindow) return [];
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return Array.isArray(printers) ? printers : [];
  } catch (err) {
    console.warn('[PPHC] list printers failed', err?.message || err);
    return [];
  }
}

function getSelectedPrinterName() {
  return String(currentSettings.printerName || '');
}

async function setSelectedPrinterName(name) {
  currentSettings.printerName = String(name || '');
  saveSettings().catch(() => {});
  return { printerName: currentSettings.printerName };
}

function listAccountsPublic() {
  const accounts = Array.isArray(currentSettings.accounts) ? currentSettings.accounts : [];
  return accounts.map((a) => ({ username: a.username, role: a.role || 'user' }));
}

const LOGIN_LOCK_MAX_FAILS = 3;
const LOGIN_LOCK_MS = 60 * 1000;
const loginAttempts = new Map();

function normalizeUsername(name) {
  return String(name || '').trim();
}

function getLoginAttempt(username) {
  const key = normalizeUsername(username);
  if (!key) return null;
  return loginAttempts.get(key) || { fails: 0, lockedUntil: 0 };
}

function setLoginAttempt(username, info) {
  const key = normalizeUsername(username);
  if (!key) return;
  loginAttempts.set(key, info);
}

function clearLoginAttempt(username) {
  const key = normalizeUsername(username);
  if (!key) return;
  loginAttempts.delete(key);
}

function isUsernameLocked(username) {
  const info = getLoginAttempt(username);
  if (!info) return { locked: false, remainingMs: 0 };
  const now = Date.now();
  if (info.lockedUntil && info.lockedUntil > now) {
    return { locked: true, remainingMs: info.lockedUntil - now };
  }
  return { locked: false, remainingMs: 0 };
}

function registerLoginFailure(username) {
  const now = Date.now();
  const info = getLoginAttempt(username) || { fails: 0, lockedUntil: 0 };
  info.fails += 1;
  if (info.fails >= LOGIN_LOCK_MAX_FAILS) {
    info.fails = 0;
    info.lockedUntil = now + LOGIN_LOCK_MS;
  }
  setLoginAttempt(username, info);
  return info;
}

function isValidUsernameFormat(username) {
  return /^[A-Za-z0-9_]{6,20}$/.test(String(username || ''));
}

function validateLogin(username, password) {
  const user = normalizeUsername(username);
  const pass = String(password || '');
  const lock = isUsernameLocked(user);
  if (lock.locked) {
    return { ok: false, locked: true, remainingMs: lock.remainingMs };
  }
  if (user === 'slk' && pass === 'slk') {
    return { ok: true, role: 'engineer', username: 'slk' };
  }
  const accounts = Array.isArray(currentSettings.accounts) ? currentSettings.accounts : [];
  const found = accounts.find((a) => String(a.username || '').trim() === user);
  if (found && String(found.password || '') === pass) {
    clearLoginAttempt(user);
    return { ok: true, role: found.role || 'user', username: found.username };
  }
  const info = registerLoginFailure(user);
  const lockedNow = info.lockedUntil && info.lockedUntil > Date.now();
  return {
    ok: false,
    locked: lockedNow,
    remainingMs: lockedNow ? info.lockedUntil - Date.now() : 0,
    triesLeft: LOGIN_LOCK_MAX_FAILS - (info.fails || 0),
  };
}

function isAdminCredential(username, password) {
  const user = normalizeUsername(username);
  if (!user) return false;
  const accounts = Array.isArray(currentSettings.accounts) ? currentSettings.accounts : [];
  const admin = accounts.find((a) => String(a.username || '').trim() === user);
  return !!admin && admin.role === 'admin' && String(admin.password || '') === String(password || '');
}

async function addAccount(account) {
  const username = normalizeUsername(account?.username);
  const password = String(account?.password || '');
  const role = String(account?.role || 'user') || 'user';
  const actor = normalizeUsername(account?.actor);
  const actorPassword = String(account?.actorPassword || '');
  if (!username || !password) throw new Error('missing username/password');
  if (!isValidUsernameFormat(username)) throw new Error('invalid username');
  if (username.toLowerCase() === 'slk') throw new Error('reserved username');
  if (actor && !isAdminCredential(actor, actorPassword)) throw new Error('unauthorized');
  const safeRole = ['admin', 'operator', 'user', 'engineer'].includes(role) ? role : 'user';
  const accounts = Array.isArray(currentSettings.accounts) ? currentSettings.accounts : [];
  if (accounts.some((a) => String(a.username || '').trim() === username)) {
    throw new Error('username exists');
  }
  currentSettings.accounts = [...accounts, { username, password, role: safeRole }];
  await saveSettings();
  return listAccountsPublic();
}

async function removeAccount(payload) {
  const user = normalizeUsername(payload?.username || payload);
  const actor = normalizeUsername(payload?.actor);
  const actorPassword = String(payload?.actorPassword || '');
  if (!user) throw new Error('missing username');
  if (user.toLowerCase() === 'admin') throw new Error('cannot remove admin');
  if (actor && !isAdminCredential(actor, actorPassword)) throw new Error('unauthorized');
  const accounts = Array.isArray(currentSettings.accounts) ? currentSettings.accounts : [];
  currentSettings.accounts = accounts.filter((a) => String(a.username || '').trim() !== user);
  await saveSettings();
  return listAccountsPublic();
}

async function resetAccountPassword(payload = {}) {
  const actor = normalizeUsername(payload.actor);
  const actorPassword = String(payload.actorPassword || '');
  const username = normalizeUsername(payload.username);
  const newPassword = String(payload.newPassword || '');
  if (!username || !newPassword) throw new Error('missing username/password');
  if (actor && !isAdminCredential(actor, actorPassword)) throw new Error('unauthorized');
  const accounts = Array.isArray(currentSettings.accounts) ? currentSettings.accounts : [];
  const exists = accounts.some((acc) => String(acc.username || '').trim() === username);
  if (!exists) throw new Error('user not found');
  const next = accounts.map((acc) => {
    if (String(acc.username || '').trim() !== username) return acc;
    return { ...acc, password: newPassword };
  });
  currentSettings.accounts = next;
  await saveSettings();
  return listAccountsPublic();
}

async function printCurrentView(opts = {}) {
  if (!mainWindow) throw new Error('window not ready');
  const printerName = String(opts.printerName || getSelectedPrinterName() || '');
  const options = {
    silent: !!printerName,
    deviceName: printerName || undefined,
    printBackground: true,
    pageSize: 'A4',
  };
  return new Promise((resolve) => {
    mainWindow.webContents.print(options, (success, failureReason) => {
      resolve({ success, failureReason: failureReason || null });
    });
  });
}

async function printReportPdf(opts = {}) {
  const printerName = String(opts?.printerName || getSelectedPrinterName() || '');
  const name = String(opts?.name || '').trim();
  if (!name) return { success: false, failureReason: 'missing report name' };
  if (!/\.pdf$/i.test(name)) return { success: false, failureReason: 'invalid file' };
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return { success: false, failureReason: 'invalid path' };
  }
  const fullPath = path.join(REPORTS_DIR, name);
  try {
    await fs.promises.access(fullPath, fs.constants.R_OK);
  } catch {
    return { success: false, failureReason: 'file not found' };
  }

  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 1000,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  try {
    await win.loadURL(pathToFileURL(fullPath).toString());
    await new Promise((resolve) => setTimeout(resolve, 300));
    const options = {
      silent: !!printerName,
      deviceName: printerName || undefined,
      printBackground: true,
      pageSize: 'A4',
    };
    const result = await new Promise((resolve) => {
      win.webContents.print(options, (success, failureReason) => {
        resolve({ success, failureReason: failureReason || null });
      });
    });
    return result;
  } catch (err) {
    console.warn('[PPHC] print report pdf failed', err?.message || err);
    return { success: false, failureReason: err?.message || String(err) };
  } finally {
    try {
      win.destroy();
    } catch {}
  }
}

function safeFilePart(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  return raw
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 64);
}

async function exportReportPdf(opts = {}) {
  if (!mainWindow) throw new Error('window not ready');
  try {
    const now = new Date();
    const ts = now.toISOString().replace(/[:.]/g, '-');
    const patientId = safeFilePart(opts.patientId);
    const fileBase = [ts, patientId].filter(Boolean).join('_') || ts;
    const fileName = `${fileBase}.pdf`;
    const outPath = path.join(REPORTS_DIR, fileName);
    await fs.promises.mkdir(REPORTS_DIR, { recursive: true });
    const pdfData = await mainWindow.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      marginsType: 1, // none
    });
    await fs.promises.writeFile(outPath, pdfData);
    return { success: true, filePath: outPath };
  } catch (err) {
    console.warn('[PPHC] export pdf failed', err?.message || err);
    return { success: false, failureReason: err?.message || String(err) };
  }
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReportHtml(data = {}) {
  const title = escapeHtml(data?.title || 'Report');
  const generatedAt = escapeHtml(data?.generatedAt || '');
  const sections = [];
  const renderTable = (items = []) =>
    items
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.value)}</td></tr>`
      )
      .join('');
  if (Array.isArray(data.patientInfo) && data.patientInfo.length) {
    sections.push(
      `<h2>${escapeHtml(data.patientTitle || 'Patient')}</h2>` +
        `<table>${renderTable(data.patientInfo)}</table>`
    );
  }
  if (Array.isArray(data.treatmentInfo) && data.treatmentInfo.length) {
    sections.push(
      `<h2>${escapeHtml(data.treatmentTitle || 'Treatment')}</h2>` +
        `<table>${renderTable(data.treatmentInfo)}</table>`
    );
  }
  if (Array.isArray(data.tips) && data.tips.length) {
    sections.push(
      `<h2>${escapeHtml(data.tipsTitle || 'Tips')}</h2>` +
        `<ul>${data.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
    );
  }
  if (data.disclaimer) {
    sections.push(
      `<h2>${escapeHtml(data.disclaimerTitle || 'Disclaimer')}</h2>` +
        `<p>${escapeHtml(data.disclaimer).replace(/\n/g, '<br />')}</p>`
    );
  }
  return `<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, "Microsoft YaHei", sans-serif; padding: 24px; color: #111; }
    h1 { text-align: center; margin: 0 0 8px; }
    h2 { margin: 20px 0 8px; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    td { border: 1px solid #ddd; padding: 8px 10px; }
    ul { margin: 0; padding-left: 18px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div>${generatedAt}</div>
  ${sections.join('')}
</body>
</html>`;
}

async function exportReportData(opts = {}) {
  try {
    const format = String(opts.format || 'word').toLowerCase();
    const now = new Date();
    const ts = now.toISOString().replace(/[:.]/g, '-');
    const patientId = safeFilePart(opts.patientId);
    const fileBase = [ts, patientId].filter(Boolean).join('_') || ts;
    const ext = format === 'excel' ? 'xls' : 'doc';
    const fileName = `${fileBase}.${ext}`;
    const outPath = path.join(REPORTS_DIR, fileName);
    await fs.promises.mkdir(REPORTS_DIR, { recursive: true });
    const html = buildReportHtml(opts.data || {});
    await fs.promises.writeFile(outPath, html, 'utf8');
    return { success: true, filePath: outPath };
  } catch (err) {
    console.warn('[PPHC] export report data failed', err?.message || err);
    return { success: false, failureReason: err?.message || String(err) };
  }
}

async function listReportPdfs(filter = {}) {
  try {
    await fs.promises.mkdir(REPORTS_DIR, { recursive: true });
    const entries = await fs.promises.readdir(REPORTS_DIR, { withFileTypes: true });
    const patientId = String(filter.patientId || '').trim();
    const items = [];
    for (const ent of entries) {
      if (!ent.isFile()) continue;
      const name = ent.name;
      if (!/\.pdf$/i.test(name)) continue;
      if (name.includes('..') || name.includes('/') || name.includes('\\\\')) continue;
      const match = name.match(/_(P\d{4})\.pdf$/i);
      const parsedPatientId = match ? match[1] : null;
      if (patientId && parsedPatientId && parsedPatientId !== patientId) continue;
      const full = path.join(REPORTS_DIR, name);
      const stat = await fs.promises.stat(full);
      items.push({
        name,
        filePath: full,
        url: pathToFileURL(full).toString(),
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        patientId: parsedPatientId,
      });
    }
    items.sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0));
    return items;
  } catch (err) {
    console.warn('[PPHC] list reports failed', err?.message || err);
    return [];
  }
}

async function shareReport(opts = {}) {
  const name = String(opts?.name || '').trim();
  if (!name) return { success: false, failureReason: 'missing name' };
  if (!/\.pdf$/i.test(name)) return { success: false, failureReason: 'invalid file' };
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return { success: false, failureReason: 'invalid path' };
  }
  const src = path.join(REPORTS_DIR, name);
  try {
    await fs.promises.access(src, fs.constants.R_OK);
  } catch {
    return { success: false, failureReason: 'file not found' };
  }
  const shareDir = path.join(REPORTS_DIR, 'share');
  await fs.promises.mkdir(shareDir, { recursive: true });
  const dest = path.join(shareDir, name);
  await fs.promises.copyFile(src, dest);
  return { success: true, filePath: dest };
}

async function removeReportPdf(name) {
  const file = String(name || '').trim();
  if (!file) return { success: false, failureReason: 'missing name' };
  if (!/\.pdf$/i.test(file)) return { success: false, failureReason: 'invalid file' };
  if (file.includes('..') || file.includes('/') || file.includes('\\')) {
    return { success: false, failureReason: 'invalid path' };
  }
  const full = path.join(REPORTS_DIR, file);
  try {
    await fs.promises.unlink(full);
    return { success: true };
  } catch (err) {
    return { success: false, failureReason: err?.message || String(err) };
  }
}

async function clearAllReports() {
  try {
    await fs.promises.mkdir(REPORTS_DIR, { recursive: true });
    const entries = await fs.promises.readdir(REPORTS_DIR, { withFileTypes: true });
    const tasks = [];
    for (const ent of entries) {
      if (!ent.isFile()) continue;
      const name = ent.name;
      if (!/\.pdf$/i.test(name)) continue;
      if (name.includes('..') || name.includes('/') || name.includes('\\')) continue;
      tasks.push(fs.promises.unlink(path.join(REPORTS_DIR, name)).catch(() => {}));
    }
    await Promise.all(tasks);
    return { success: true };
  } catch (err) {
    return { success: false, failureReason: err?.message || String(err) };
  }
}


// =============================================
// 4) 创建窗口
// =============================================
function createWindow() {
  const HIDE_CURSOR = true;
  mainWindow = new BrowserWindow({
    width: 2560,
    height: 1600,
    minWidth: 2560,
    minHeight: 1600,
    maxWidth: 2560,
    maxHeight: 1600,
    resizable: false,
    fullscreen: true,
    kiosk: true,
    fullscreenable: true,
    alwaysOnTop: true,
    frame: false,
    autoHideMenuBar: true,
    show: false, // delay showing to avoid white flash
    backgroundColor: '#050608',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const query = {};
  if (process.env.PPHC_DEBUG_WEB) query.debugWeb = '1';
  if (process.env.PPHC_DEBUG_MOUSE) query.debugMouse = '1';
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'), { query });

  mainWindow.webContents.on('dom-ready', () => {
    if (!HIDE_CURSOR || !mainWindow) return;
    try {
      mainWindow.webContents.insertCSS('html, body, * { cursor: none !important; }');
    } catch {}
  });

  mainWindow.webContents.once('did-finish-load', () => {
    // 等页面加载完再展示，减少背景色闪烁
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
    broadcastPorts();
  });

  // forward serial events
  serial.on('serial-data', (ch, value) => {
    mainWindow.webContents.send('serial-data', { ch, value });
  });
  serial.on('connection-changed', (connected) => {
    mainWindow.webContents.send('connection-changed', connected);
  });
  serial.on('heartbeat-ack', (value) => {
    mainWindow.webContents.send('heartbeat-ack', value);
  });
  serial.on('system-state', (value) => {
    mainWindow.webContents.send('system-state', value);
  });
  serial.on('alarm-state', (value) => {
    mainWindow.webContents.send('alarm-state', value);
  });
  serial.on('stop-treatment', (value) => {
    mainWindow.webContents.send('stop-treatment', value);
    ledShowStopAlert();
  });
  serial.on('shield-state', (value) => {
    mainWindow.webContents.send('shield-state', value);
  });
  serial.on('mode-curves', (value) => {
    mainWindow.webContents.send('mode-curves', value);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// =============================================
// 5) 列出 serial ports
// =============================================
async function broadcastPorts() {
  try {
    const ports = await serial.listPorts();
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('ports', ports);
    }
  } catch {}
}

// =============================================
// 6) app.whenReady()
// =============================================
app.whenReady().then(() => {
  initStoragePaths();
  loadSettings();
  initLogging();
  console.log('[PPHC] logging started', currentLogFile);
  console.log('[PPHC] audio config', {
    alsaCard: ALSA_CARD,
    alsaDevice: ALSA_DEVICE || null,
    xdgRuntimeDir: process.env.XDG_RUNTIME_DIR || null,
  });
  console.log('[PPHC] led config', {
    ledCount: Number.isFinite(LED_COUNT) ? LED_COUNT : 51,
    spiBus: Number.isFinite(SPI_BUS) ? SPI_BUS : 0,
    spiDevice: Number.isFinite(SPI_DEVICE) ? SPI_DEVICE : 0,
    spiSpeedHz: Number.isFinite(SPI_SPEED_HZ) ? SPI_SPEED_HZ : 2_400_000,
  });
  // 启动即关背光，1 秒后再恢复为目标亮度
  if (IS_LINUX) {
    setBrightnessPercent(0, { skipSave: true, allowZero: true }).catch(() => {});
    setTimeout(() => {
      if (Number.isFinite(currentSettings.brightness)) {
        setBrightnessPercent(currentSettings.brightness).catch(() => {});
      }
    }, 500);
    if (Number.isFinite(currentSettings.volume)) {
      setVolumePercent(currentSettings.volume).catch(() => {});
    }
    applyChimeSetting().catch(() => {});
  }
  createWindow();

  try {
    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);
  } catch {}

  broadcastPorts();
  setInterval(broadcastPorts, 3000);
  ledShowIdle();
  speakStartup();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// =============================================
// 7) 退出
// =============================================
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// =============================================
// 8) IPC handlers
// =============================================
ipcMain.handle('list-ports', async () => serial.listPorts());
ipcMain.handle('connect', async (e, { port, baud }) => serial.connect(port, baud));
ipcMain.handle('disconnect', async () => serial.disconnect());
ipcMain.handle('send-u8', async (e, { frameId, value }) => {
  const sent = serial.sendU8(frameId, value);
  if (leds && value) {
    if (frameId === proto.U8_START_TREATMENT) ledShowRunning();
    else if (frameId === proto.U8_STOP_TREATMENT) ledShowStopAlert();
  }
  return sent;
});
ipcMain.handle('send-f32', async (e, { frameId, value }) => serial.sendF32(frameId, value));
ipcMain.handle('send-u16', async (e, { frameId, value }) => serial.sendU16(frameId, value));
ipcMain.handle('send-text', async (e, { frameId, text }) => serial.sendText(frameId, text));
ipcMain.handle('send-u32', async (e, { frameId, value }) => serial.sendU32(frameId, value));
ipcMain.handle('exit-app', async () => {
  if (mainWindow) mainWindow.close();
  else app.quit();
  return true;
});
ipcMain.handle('get-brightness', async () => getBrightnessPercent());
ipcMain.handle('set-brightness', async (e, { percent }) => setBrightnessPercent(percent));
ipcMain.handle('get-volume', async () => ({ percent: currentSettings.volume || 0 }));
ipcMain.handle('set-volume', async (e, { percent }) => setVolumePercent(percent));
ipcMain.handle('get-play-chime', async () => ({ on: !!currentSettings.playChime }));
ipcMain.handle('set-play-chime', async (e, { on }) => {
  currentSettings.playChime = !!on;
  saveSettings().catch(() => {});
  applyChimeSetting().catch(() => {});
  return { on: currentSettings.playChime };
});
ipcMain.handle('get-pressure-alert-sound', async () => ({ on: !!currentSettings.pressureAlertSound }));
ipcMain.handle('set-pressure-alert-sound', async (_e, { on }) => {
  currentSettings.pressureAlertSound = !!on;
  saveSettings().catch(() => {});
  return { on: currentSettings.pressureAlertSound };
});
ipcMain.handle('settings:get', async () => getAppSettings());
ipcMain.handle('settings:update', async (_e, patch) => updateAppSettings(patch));
ipcMain.handle('sound:play', async (_e, { key }) => playPromptSound(key));
ipcMain.handle('led:test', async () => {
  if (!leds) return { ok: false, error: 'unsupported platform' };
  try {
    const ok = await leds.flashColor([64, 64, 64], 1200, 200, DEFAULT_COLORS.idle);
    return { ok: !!ok };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
});
ipcMain.handle('patients:list', async () => loadPatients());
ipcMain.handle('patients:add', async (e, patient) => {
  const list = loadPatients();
  const requestedId = normalizePatientIdInput(patient?.id);
  if (requestedId && list.some((p) => normalizePatientIdInput(p?.id) === requestedId)) {
    throw new Error('patient id exists');
  }
  const id = requestedId || nextPatientId(list);
  const now = new Date().toISOString();
  const entry = {
    id,
    name: String(patient?.name || '').trim(),
    gender: patient?.gender === '女' || patient?.gender === 'female' ? '女' : '男',
    phone: String(patient?.phone || '').trim(),
    birth: String(patient?.birth || '').trim(),
    notes: String(patient?.notes || '').trim(),
    therapist: String(patient?.therapist || '').trim(),
    deviceModel: String(patient?.deviceModel || '').trim(),
    status: String(patient?.status || 'active') || 'active',
    photoData: patient?.photoData || null,
    lastTreatment: patient?.lastTreatment || null,
    lastParams: patient?.lastParams || null,
    createdAt: now,
    updatedAt: now,
  };
  const nextList = [...list, entry];
  const saved = await savePatients(nextList);
  if (!saved) throw new Error('保存病例信息失败');
  return entry;
});
ipcMain.handle('patients:update', async (_e, payload) =>
  updatePatientById(payload?.id, payload?.patch || {})
);
ipcMain.handle('patients:remove', async (_e, id) => removePatientById(id));
ipcMain.handle('patients:restore', async (_e, payload) => restorePatients(payload));
ipcMain.handle('patients:clear', async () => clearAllPatients());
ipcMain.handle('logs:list', async () => listLogFiles());
ipcMain.handle('logs:read', async (_e, name) => readLogFile(name));
ipcMain.handle('updates:check', async () => checkForUpdates());
ipcMain.handle('printers:list', async () => listPrinters());
ipcMain.handle('printers:get', async () => ({ printerName: getSelectedPrinterName() }));
ipcMain.handle('printers:set', async (_e, name) => setSelectedPrinterName(name));
ipcMain.handle('print:report', async (_e, opts) => printCurrentView(opts));
ipcMain.handle('report:export-pdf', async (_e, opts) => exportReportPdf(opts));
ipcMain.handle('report:export-data', async (_e, opts) => exportReportData(opts));
ipcMain.handle('reports:list', async (_e, filter) => listReportPdfs(filter));
ipcMain.handle('report:share', async (_e, opts) => shareReport(opts));
ipcMain.handle('reports:remove', async (_e, name) => removeReportPdf(name));
ipcMain.handle('reports:clear', async () => clearAllReports());
ipcMain.handle('auth:login', async (_e, { username, password }) => validateLogin(username, password));
ipcMain.handle('accounts:list', async () => listAccountsPublic());
ipcMain.handle('accounts:add', async (_e, account) => addAccount(account));
ipcMain.handle('accounts:remove', async (_e, payload) => removeAccount(payload));
ipcMain.handle('accounts:reset', async (_e, payload) => resetAccountPassword(payload));
ipcMain.handle('print:report-pdf', async (_e, opts) => printReportPdf(opts));
ipcMain.on('logs:renderer', (_e, payload) => {
  const level = payload?.level || 'info';
  const message = payload?.message || '';
  const stack = payload?.stack || '';
  appendLogLine('renderer', level, [message, stack].filter(Boolean));
});
