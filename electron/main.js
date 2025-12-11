// ============ Electron 主进程 ============
// 强制 Electron 使用 Wayland（Ozone）模式
// ① 必须先拿到 app 对象，再设置 GPU 开关
const { app, BrowserWindow, ipcMain } = require('electron');

// Disable GPU to avoid crashes when GLES drivers cannot be loaded
app.disableHardwareAcceleration();

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

// =======================================================
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { SerialManager } = require('./serial');
const proto = require('./protocol');
const { Ws2812Driver, DEFAULT_COLORS } = require('./ws2812');

const expandPath = (p) => {
  if (!p) return p;
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
};

let mainWindow;
const serial = new SerialManager();
const leds = process.platform === 'linux' ? new Ws2812Driver({ ledCount: 51, defaultColor: DEFAULT_COLORS.idle }) : null;

const BRIGHTNESS_PATH = '/sys/class/backlight/backlight2/brightness';
const MAX_BRIGHTNESS_PATH = '/sys/class/backlight/backlight2/max_brightness';
const DEFAULT_MAX_BRIGHTNESS = 255;
const SETTINGS_PATH = (() => {
  // 开发时写到项目根目录，打包后写到可执行文件同目录
  const base = app.isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');
  return path.join(base, 'settings.json');
})();
const STARTUP_SPEECH = {
  zh: '设备已启动，请连接治疗仪。',
  en: 'System is ready. Please connect the device.',
};
const DEFAULT_SETTINGS = { brightness: 80, volume: 100, playChime: true };
let currentSettings = { ...DEFAULT_SETTINGS };
let settingsFresh = true;

async function readNumber(filePath) {
  const raw = await fs.promises.readFile(filePath, 'utf8');
  const num = Number.parseInt(String(raw).trim(), 10);
  if (Number.isNaN(num)) throw new Error(`Invalid numeric content from ${filePath}`);
  return num;
}

async function resolveMaxBrightness() {
  try {
    return await readNumber(MAX_BRIGHTNESS_PATH);
  } catch (err) {
    console.warn('[PPHC] max brightness fallback ->', DEFAULT_MAX_BRIGHTNESS, err.message);
    return DEFAULT_MAX_BRIGHTNESS;
  }
}

async function getBrightnessPercent() {
  const max = await resolveMaxBrightness();
  const raw = await readNumber(BRIGHTNESS_PATH);
  const percent = Math.round((raw / max) * 100);
  return {
    raw,
    max,
    percent: Math.max(0, Math.min(100, percent)),
  };
}

async function setBrightnessPercent(percent) {
  const max = await resolveMaxBrightness();
  const pctRaw = Number(percent);
  const pct = Number.isFinite(pctRaw) ? Math.max(0, Math.min(100, pctRaw)) : 0;
  const raw = Math.round((pct / 100) * max);
  await fs.promises.writeFile(BRIGHTNESS_PATH, String(raw));
  currentSettings.brightness = pct;
  saveSettings().catch(() => {});
  return { raw, max, percent: pct };
}

function ledShowIdle() {
  if (!leds) return;
  leds.showIdle();
}

function ledShowRunning() {
  if (!leds) return;
  leds.showRunning();
}

function ledShowStopAlert() {
  if (!leds) return;
  leds.showStopAlert();
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    settingsFresh = false;
  } catch {
    currentSettings = { ...DEFAULT_SETTINGS };
    settingsFresh = true;
  }
}

async function saveSettings() {
  try {
    await fs.promises.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(currentSettings, null, 2), 'utf8');
  } catch (err) {
    console.warn('[PPHC] save settings failed', err?.message || err);
  }
}

async function setVolumePercent(percent) {
  const pctRaw = Number(percent) || 0;
  const pctClamped = Math.max(0, Math.min(100, pctRaw));
  let target = 0;
  if (pctClamped > 0) {
    target = 80 + (pctClamped / 100) * 20; // map 1-100 -> 80-100
  }
  const args = ['-c', '0', 'set', 'PCM', `${Math.round(target)}%`];
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
  const tasks = [
    ['-c', '0', 'set', 'Speaker', 'on'],
    ['-c', '0', 'set', 'Headphone', 'on'],
    ['-c', '0', 'set', 'PCM', '100%'],
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
  const tasks = [
    ['-c', '0', 'set', 'Speaker', 'off'],
    ['-c', '0', 'set', 'Headphone', 'off'],
    ['-c', '0', 'set', 'PCM', '0%', 'mute'],
  ];
  for (const args of tasks) {
    try {
      await runAmixer(args);
    } catch (err) {
      console.warn('[PPHC] amixer off failed', args.join(' '), err?.message || err);
    }
  }
}

async function applyChimeSetting() {
  if (settingsFresh && currentSettings.playChime) {
    await ensureAudioOutputsOn().catch(() => {});
    return;
  }
  if (currentSettings.playChime) {
    await ensureAudioOutputsOn().catch(() => {});
  } else {
    await ensureAudioOutputsOff().catch(() => {});
  }
}

let spokeOnce = false;
function speakStartup() {
  // TTS disabled; using pre-recorded audio in renderer.
  return;
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


// =============================================
// 4) 创建窗口
// =============================================
function createWindow() {
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
    backgroundColor: '#000000',
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.once('did-finish-load', () => {
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
  loadSettings();
  if (Number.isFinite(currentSettings.brightness)) {
    setBrightnessPercent(currentSettings.brightness).catch(() => {});
  }
  if (Number.isFinite(currentSettings.volume)) {
    setVolumePercent(currentSettings.volume).catch(() => {});
  }
  applyChimeSetting().catch(() => {});
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
