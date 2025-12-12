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

// =======================================================
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { SerialManager } = require('./serial');
const proto = require('./protocol');
const { Ws2812Driver, DEFAULT_COLORS } = require('./ws2812');

const IS_LINUX = process.platform === 'linux';

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
const leds = IS_LINUX ? new Ws2812Driver({ ledCount: 51, defaultColor: DEFAULT_COLORS.idle }) : null;

const BRIGHTNESS_PATH = IS_LINUX ? '/sys/class/backlight/backlight2/brightness' : null;
const MAX_BRIGHTNESS_PATH = IS_LINUX ? '/sys/class/backlight/backlight2/max_brightness' : null;
const DEFAULT_MAX_BRIGHTNESS = 255;
const SETTINGS_PATH = (() => {
  // 开发时写到项目根目录，打包后写到可执行文件同目录
  const base = app.isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');
  return path.join(base, 'settings.json');
})();
const PATIENTS_DIR = (() => {
  const base = app.isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');
  return path.join(base, 'patients');
})();
const PATIENTS_FILE = path.join(PATIENTS_DIR, 'patients.json');
const LOGS_DIR = (() => {
  const base = app.isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');
  return path.join(base, 'logs');
})();
const UPDATES_FILE = (() => {
  const base = app.isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');
  return path.join(base, 'updates', 'latest.json');
})();
let currentLogFile = null;
let logStream = null;
const STARTUP_SPEECH = {
  zh: '设备已启动，请连接治疗仪。',
  en: 'System is ready. Please connect the device.',
};
const DEFAULT_SETTINGS = { brightness: 80, volume: 100, playChime: true, printerName: '' };
let currentSettings = { ...DEFAULT_SETTINGS };
let settingsFresh = true;

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
      ? Math.max(0, Math.min(100, currentSettings.brightness))
      : 80;
    return { raw: 0, max: DEFAULT_MAX_BRIGHTNESS, percent };
  }
  const max = await resolveMaxBrightness();
  const raw = await readNumber(BRIGHTNESS_PATH);
  const percent = Math.round((raw / max) * 100);
  return {
    raw,
    max,
    percent: Math.max(0, Math.min(100, percent)),
  };
}

async function setBrightnessPercent(percent, opts = {}) {
  if (!IS_LINUX || !BRIGHTNESS_PATH) {
    const pctRaw = Number(percent);
    const pct = Number.isFinite(pctRaw) ? Math.max(0, Math.min(100, pctRaw)) : 0;
    if (!opts.skipSave) {
      currentSettings.brightness = pct;
      saveSettings().catch(() => {});
    }
    return { raw: 0, max: DEFAULT_MAX_BRIGHTNESS, percent: pct };
  }
  const max = await resolveMaxBrightness();
  const pctRaw = Number(percent);
  const pct = Number.isFinite(pctRaw) ? Math.max(0, Math.min(100, pctRaw)) : 0;
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
  if (!IS_LINUX) return;
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

function loadPatients() {
  try {
    const raw = fs.readFileSync(PATIENTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

async function savePatients(list) {
  try {
    await fs.promises.mkdir(PATIENTS_DIR, { recursive: true });
    await fs.promises.writeFile(PATIENTS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[PPHC] save patients failed', err?.message || err);
    return false;
  }
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

async function applyChimeSetting() {
  if (!IS_LINUX) return;
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
  loadSettings();
  initLogging();
  console.log('[PPHC] logging started', currentLogFile);
  // 启动即关背光，1 秒后再恢复为目标亮度
  if (IS_LINUX) {
    setBrightnessPercent(0, { skipSave: true }).catch(() => {});
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
ipcMain.handle('patients:list', async () => loadPatients());
ipcMain.handle('patients:add', async (e, patient) => {
  const list = loadPatients();
  const id = nextPatientId(list);
  const now = new Date().toISOString();
  const entry = {
    id,
    name: String(patient?.name || '').trim(),
    gender: patient?.gender === '女' || patient?.gender === 'female' ? '女' : '男',
    phone: String(patient?.phone || '').trim(),
    birth: String(patient?.birth || '').trim(),
    notes: String(patient?.notes || '').trim(),
    createdAt: now,
    updatedAt: now,
  };
  const nextList = [...list, entry];
  const saved = await savePatients(nextList);
  if (!saved) throw new Error('保存病例信息失败');
  return entry;
});
ipcMain.handle('logs:list', async () => listLogFiles());
ipcMain.handle('logs:read', async (_e, name) => readLogFile(name));
ipcMain.handle('updates:check', async () => checkForUpdates());
ipcMain.handle('printers:list', async () => listPrinters());
ipcMain.handle('printers:get', async () => ({ printerName: getSelectedPrinterName() }));
ipcMain.handle('printers:set', async (_e, name) => setSelectedPrinterName(name));
ipcMain.handle('print:report', async (_e, opts) => printCurrentView(opts));
ipcMain.on('logs:renderer', (_e, payload) => {
  const level = payload?.level || 'info';
  const message = payload?.message || '';
  const stack = payload?.stack || '';
  appendLogLine('renderer', level, [message, stack].filter(Boolean));
});
