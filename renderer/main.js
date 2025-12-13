(function () {
  if (window.__PPHC_BOOTED__) return;
  window.__PPHC_BOOTED__ = true;

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));
  const api = window.api;
  const WEB_DEBUG = !!window.__PPHC_WEBDEBUG__;

  // Basic error logging so UI issues are visible in DevTools console
  window.addEventListener('error', (e) => {
    console.error('[PPHC] window error:', e.error || e.message, e);
    try {
      api?.logToMain?.({
        level: 'error',
        message: e.message || String(e.error || 'window error'),
        stack: e.error?.stack || null,
        source: 'renderer',
      });
    } catch {}
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[PPHC] unhandled rejection:', e.reason);
    try {
      api?.logToMain?.({
        level: 'error',
        message: String(e.reason?.message || e.reason || 'unhandled rejection'),
        stack: e.reason?.stack || null,
        source: 'renderer',
      });
    } catch {}
  });

  const TRANSLATIONS = {
    zh: {
      appTitle: '眼部热脉冲控制',
      exit: '退出程序',
      homeTitle: '睑板腺热脉动治疗仪',
      homeSubtitle: 'Thermal Pulsation System',
      homeDesc: '',
      btnDeviceLabel: '设置',
      btnDeviceSub: 'Settings',
      btnQuickLabel: '开始治疗',
      btnQuickSub: 'Start',
      btnNewPatientLabel: '新建档案',
      btnNewPatientSub: 'Create Profile',
      btnPatientListLabel: '病例列表',
      btnPatientListSub: 'Patient Files',
      newPatientTitle: '新建档案',
      patientListTitle: '病例列表',
      patientListEmpty: '暂无病例，请先创建。',
      patientSaved: '保存成功',
      patientSaveFailed: '保存失败，请重试。',
      patientNameRequired: '请输入姓名',
      patientLoadFailed: '病例读取失败',
      patientId: '患者编号',
      patientName: '姓名',
      patientGender: '性别',
      patientPhone: '联系电话',
      patientBirth: '出生日期',
      patientNotes: '备注信息',
      patientCreatedAt: '建档日期',
      datePickerToday: '今天',
      datePickerCancel: '取消',
      datePickerBack: '返回',
      datePickerSelectYear: '选择年份',
      logsTitle: '系统日志',
      logsEmpty: '暂无日志',
      logsRefresh: '刷新',
      logsLoading: '加载日志中...',
      logsReadFailed: '读取日志失败',
      updateAvailable: '发现新版本',
      updateNotAvailable: '当前已是最新版本',
      updateCheckFailed: '检查更新失败',
      quickTitle: '快速治疗',
      quickPatientTitle: '患者选择',
      quickPatientSelectedNone: '未选择',
      quickPatientEmpty: '暂无患者，请先创建档案。',
      summaryOverline: '实时数据',
      summaryTitle: '压力 / 温度',
      curveOverline: '实时曲线',
      curveTitle: '数据曲线',
      legendPressureLeft: '左眼压力',
      legendPressureRight: '右眼压力',
      legendTempLeft: '左眼温度',
      legendTempRight: '右眼温度',
      leftEye: '左眼',
      rightEye: '右眼',
      temperature: '温度',
      shieldPanelTitle: '眼盾状态',
      shieldPresentLabel: '是否在线',
      shieldFuseLabel: '是否熔断',
      shieldOnline: '在线',
      shieldOffline: '未连接',
      shieldPresentYes: '在线',
      shieldPresentNo: '离线',
      fuseOk: '正常',
      fuseBlown: '熔断',
      controlOverline: '控制参数',
      controlTitle: '',
      pressureEyebrow: '目标压力',
      pressureStrong: '',
      durationEyebrow: '治疗时间',
      durationStrong: '',
      start: '开始',
      stop: '停止',
      exportAfterTreatmentTitle: '治疗完成',
      exportAfterTreatmentText: '是否需要导出报告？',
      exportAfterTreatmentNo: '暂不导出',
      exportAfterTreatmentYes: '导出报告',
      running: '运行中',
      standby: '待机',
      runStateLabel: '挤压状态',
      alarmLabel: '报警',
      systemStateLabel: '系统状态',
      connectionStateLabel: '连接状态',
      heartbeatLabel: '心跳延迟',
      settingsTitle: '系统设置',
      navDisplay: '显示',
      navDisplayHint: '亮度 / 屏保',
      navSound: '声音',
      navSoundHint: '音量 / 提示',
      navPrinter: '打印机',
      navPrinterHint: '选择 / 设置',
      navAccounts: '账户',
      navAccountsHint: '添加 / 管理',
      navLanguage: '语言',
      navLanguageHint: '中文 / English',
      navAbout: '关于',
      navAboutHint: '版本 / 更新',
      navLogs: '日志',
      navLogsHint: '查看 / 导出',
      printerTitle: '打印机',
      printerSelectLabel: '选择打印机',
      printerSelectHint: '用于打印病例报告',
      printerCurrentLabel: '当前',
      printersRefresh: '刷新列表',
      printerEmpty: '未检测到打印机',
      printerSaved: '打印机已保存',
      printerSaveFailed: '保存失败，请重试',
      printerNotSet: '未设置打印机',
      default: '默认',
      loginFailed: '账号或密码错误，请重试。',
      accountsTitle: '账户',
      accountsAddTitle: '添加账户',
      accountsAddHint: '新账户可用于登录系统',
      accountsUsernameLabel: '账号',
      accountsPasswordLabel: '密码',
      accountsPassword2Label: '确认密码',
      accountsAddBtn: '添加',
      accountsRemoveBtn: '删除',
      accountsLogoutBtn: '退出登录',
      accountsEmpty: '暂无账户',
      accountsAddSuccess: '添加成功',
      accountsAddFailed: '添加失败',
      accountsPasswordMismatch: '两次密码不一致',
      accountsRemoveFailed: '删除失败',
      reportScreenTitle: '打印报告',
      reportSuffix: '报告',
      reportPatientInfoTitle: '患者信息',
      reportTreatmentInfoTitle: '治疗信息',
      reportTipsTitle: '干眼注意事项',
      reportDisclaimerTitle: '医疗报告说明',
      reportDoctorSign: '医生签名：________________',
      reportDoctorDate: '日期：________________',
      reportGeneratedAtLabel: '报告生成时间',
      reportPressureLabel: '治疗压力',
      reportDurationLabel: '治疗时长',
      reportModeLabel: '治疗模式',
      reportTempLabel: '治疗温度',
      reportSidesLabel: '治疗眼别',
      reportStartTimeLabel: '治疗开始时间',
      printReport: '打印报告',
      exportPdf: '导出PDF',
      exportingPdf: '正在导出PDF...',
      exportPdfSuccess: 'PDF已导出',
      exportPdfFailed: 'PDF导出失败',
      reportArchiveTitle: '报告列表',
      reportArchiveOpen: '报告',
      reportArchiveRefresh: '刷新',
      reportArchiveEmpty: '暂无报告，请先导出。',
      reportArchivePrint: '打印',
      deleteOne: '删除',
      clearAll: '清空',
      patientDeleteNeedSelect: '请先选择要删除的病例',
      patientDeleted: '已删除',
      patientDeleteFailed: '删除失败',
      patientsCleared: '已清空病例',
      patientsClearFailed: '清空失败',
      reportDeleteNeedSelect: '请先选择要删除的报告',
      reportDeleted: '已删除报告',
      reportDeleteFailed: '删除报告失败',
      reportsCleared: '已清空报告',
      reportsClearFailed: '清空报告失败',
      printingReport: '正在打印...',
      printSuccess: '打印成功',
      printFailed: '打印失败',
      printNoPrinter: '请先在设置中选择打印机',
      engineerTitle: '工程模式',
      engineerParamsTitle: '治疗参数',
      engineerTestTitle: '设备测试',
      engineerPressureLabel: '压力',
      engineerDurationLabel: '时间',
      engineerTempLabel: '温度',
      engineerBrightnessLabel: '屏幕亮度',
      engineerVolumeLabel: '系统音量',
      engineerApplyToDevice: '下发到设备',
      engineerTestSound: '测试提示音',
      engineerNeedConnect: '请先连接设备',
      engineerApplied: '参数已下发',
      displayCardTitle: '显示',
      displayCardDesc: '模仿 macOS 样式的柔和背光与模糊效果。',
      brightnessLabel: '屏幕亮度',
      brightnessHint: '调整 UI 辉度',
      brightnessApplyFailed: '设置亮度失败，请检查权限或背光设备',
      screensaverLabel: '屏保等待',
      screensaverHint: '自动进入屏保的倒计时',
      soundTitle: '声音',
      volumeLabel: '系统音量',
      volumeHint: '播放提示与反馈',
      chimeLabel: '提示音',
      chimeHint: '重要操作播放提示',
      languageTitle: '语言',
      languageDesc: '中英文切换，实时调整界面文案。',
      languageLabel: '界面语言',
      languageHint: '偏好选择',
      langZh: '中文',
      langEn: 'English',
      aboutTitle: '关于 / 更新',
      aboutVersion: '程序版本',
      aboutFirmware: '固件版本',
      aboutCheck: '检查更新',
      aboutLogs: '打开日志',
      currentStage: '当前阶段',
      stageIdle: '待机',
      stageRising: '升压',
      stageHold: '恒压',
      stagePulse: '脉冲',
      modeLabelRise: '升压段',
      modeLabelHold: '恒压段',
      modeLabelPulse: '脉冲段',
      shieldModalTitle: '眼盾未就绪',
      shieldModalText: '请确认左右眼盾均已佩戴并与接口接触可靠。',
      shieldLostTitle: '眼盾断开',
      shieldLostText: '检测到眼盾离线，治疗已停止，请检查佩戴情况并重试。',
      shieldLostBack: '返回',
      shieldConfirmTitleLeft: '左侧眼盾异常',
      shieldConfirmTitleRight: '右侧眼盾异常',
      shieldConfirmTextLeft: '检测到左侧通路异常，是否只治疗右侧？',
      shieldConfirmTextRight: '检测到右侧通路异常，是否只治疗左侧？',
      confirmCancel: '取消',
      confirmContinue: '继续',
      connected: '已连接',
      disconnected: '未连接',
      heartbeatTimeout: '心跳超时，请检查设备连接',
      countdownDone: '治疗完成，已自动停止',
      stoppedByDevice: '设备停止了本次治疗',
      shieldMissing: '未检测到眼盾，无法启动，请佩戴后再试',
      checkingUpdates: '检查更新中...',
      logsHint: '日志目录打开功能待接入',
    },
    en: {
      appTitle: 'Thermal Pulsation Control',
      exit: 'Exit',
      homeTitle: 'Thermal Pulsation System',
      homeSubtitle: 'Thermal Pulsation System',
      homeDesc: '',
      btnDeviceLabel: 'Device Settings',
      btnDeviceSub: 'Hardware & Preferences',
      btnQuickLabel: 'Start Treatment',
      btnQuickSub: 'Quick Session',
      btnNewPatientLabel: 'New Record',
      btnNewPatientSub: 'Create Profile',
      btnPatientListLabel: 'Case List',
      btnPatientListSub: 'Patient Files',
      newPatientTitle: 'New Record',
      patientListTitle: 'Case List',
      patientListEmpty: 'No records yet. Create one first.',
      patientSaved: 'Saved',
      patientSaveFailed: 'Save failed, try again.',
      patientNameRequired: 'Name is required',
      patientLoadFailed: 'Unable to read records',
      patientId: 'Patient ID',
      patientName: 'Name',
      patientGender: 'Gender',
      patientPhone: 'Phone',
      patientBirth: 'Birth Date',
      patientNotes: 'Notes',
      patientCreatedAt: 'Created',
      datePickerToday: 'Today',
      datePickerCancel: 'Cancel',
      datePickerBack: 'Back',
      datePickerSelectYear: 'Select Year',
      logsTitle: 'System Logs',
      logsEmpty: 'No logs yet',
      logsRefresh: 'Refresh',
      logsLoading: 'Loading logs...',
      logsReadFailed: 'Failed to read log',
      updateAvailable: 'New version available',
      updateNotAvailable: 'Already up to date',
      updateCheckFailed: 'Update check failed',
      quickTitle: 'Quick Session',
      quickPatientTitle: 'Patient',
      quickPatientSelectedNone: 'Not selected',
      quickPatientEmpty: 'No patients yet. Create a profile first.',
      summaryOverline: 'Live Data',
      summaryTitle: 'Pressure / Temp',
      curveOverline: 'Live Curves',
      curveTitle: 'Signal Traces',
      legendPressureLeft: 'Left Pressure',
      legendPressureRight: 'Right Pressure',
      legendTempLeft: 'Left Temp',
      legendTempRight: 'Right Temp',
      leftEye: 'Left Eye',
      rightEye: 'Right Eye',
      temperature: 'Temp',
      shieldPanelTitle: 'Shield Status',
      shieldPresentLabel: 'Wear',
      shieldFuseLabel: 'Fuse',
      shieldOnline: 'Online',
      shieldOffline: 'Offline',
      shieldPresentYes: 'Worn',
      shieldPresentNo: 'Not Worn',
      fuseOk: 'OK',
      fuseBlown: 'Blown',
      controlOverline: 'Controls',
      controlTitle: '',
      pressureEyebrow: 'Target Pressure',
      pressureStrong: '',
      durationEyebrow: 'Duration',
      durationStrong: '',
      start: 'Start',
      stop: 'Stop',
      exportAfterTreatmentTitle: 'Session Complete',
      exportAfterTreatmentText: 'Export report now?',
      exportAfterTreatmentNo: 'Not now',
      exportAfterTreatmentYes: 'Export',
      running: 'Running',
      standby: 'Standby',
      runStateLabel: 'Run State',
      alarmLabel: 'Alarm',
      systemStateLabel: 'System State',
      connectionStateLabel: 'Connection',
      heartbeatLabel: 'Heartbeat Age',
      settingsTitle: 'Settings',
      navDisplay: 'Display',
      navDisplayHint: 'Brightness / Saver',
      navSound: 'Sound',
      navSoundHint: 'Volume / Chime',
      navPrinter: 'Printer',
      navPrinterHint: 'Select / Setup',
      navAccounts: 'Accounts',
      navAccountsHint: 'Add / Manage',
      navLanguage: 'Language',
      navLanguageHint: 'Chinese / English',
      navAbout: 'About',
      navAboutHint: 'Version / Updates',
      navLogs: 'Logs',
      navLogsHint: 'View / Export',
      printerTitle: 'Printer',
      printerSelectLabel: 'Select Printer',
      printerSelectHint: 'Used for case report printing',
      printerCurrentLabel: 'Current',
      printersRefresh: 'Refresh List',
      printerEmpty: 'No printers found',
      printerSaved: 'Printer saved',
      printerSaveFailed: 'Save failed. Please retry.',
      printerNotSet: 'Printer not set',
      default: 'Default',
      loginFailed: 'Invalid username or password.',
      accountsTitle: 'Accounts',
      accountsAddTitle: 'Add Account',
      accountsAddHint: 'New accounts can log into the system',
      accountsUsernameLabel: 'Username',
      accountsPasswordLabel: 'Password',
      accountsPassword2Label: 'Confirm Password',
      accountsAddBtn: 'Add',
      accountsRemoveBtn: 'Remove',
      accountsLogoutBtn: 'Log out',
      accountsEmpty: 'No accounts',
      accountsAddSuccess: 'Added',
      accountsAddFailed: 'Add failed',
      accountsPasswordMismatch: 'Passwords do not match',
      accountsRemoveFailed: 'Remove failed',
      reportScreenTitle: 'Print Report',
      reportSuffix: 'Report',
      reportPatientInfoTitle: 'Patient Information',
      reportTreatmentInfoTitle: 'Treatment Information',
      reportTipsTitle: 'Dry Eye Care Tips',
      reportDisclaimerTitle: 'Medical Report Notes',
      reportDoctorSign: 'Physician Signature: ________________',
      reportDoctorDate: 'Date: ________________',
      reportGeneratedAtLabel: 'Report Generated At',
      reportPressureLabel: 'Pressure',
      reportDurationLabel: 'Duration',
      reportModeLabel: 'Mode',
      reportTempLabel: 'Temperature',
      reportSidesLabel: 'Eyes',
      reportStartTimeLabel: 'Treatment Started At',
      printReport: 'Print Report',
      exportPdf: 'Export PDF',
      exportingPdf: 'Exporting PDF...',
      exportPdfSuccess: 'PDF exported',
      exportPdfFailed: 'PDF export failed',
      reportArchiveTitle: 'Report Files',
      reportArchiveOpen: 'Reports',
      reportArchiveRefresh: 'Refresh',
      reportArchiveEmpty: 'No reports yet. Export one first.',
      reportArchivePrint: 'Print',
      deleteOne: 'Delete',
      clearAll: 'Clear',
      patientDeleteNeedSelect: 'Select a patient to delete',
      patientDeleted: 'Deleted',
      patientDeleteFailed: 'Delete failed',
      patientsCleared: 'Cleared all patients',
      patientsClearFailed: 'Clear failed',
      reportDeleteNeedSelect: 'Select a report to delete',
      reportDeleted: 'Deleted report',
      reportDeleteFailed: 'Delete report failed',
      reportsCleared: 'Cleared all reports',
      reportsClearFailed: 'Clear reports failed',
      printingReport: 'Printing...',
      printSuccess: 'Printed successfully',
      printFailed: 'Print failed',
      printNoPrinter: 'Select a printer in Settings first',
      engineerTitle: 'Engineer Mode',
      engineerParamsTitle: 'Treatment Params',
      engineerTestTitle: 'Diagnostics',
      engineerPressureLabel: 'Pressure',
      engineerDurationLabel: 'Duration',
      engineerTempLabel: 'Temperature',
      engineerBrightnessLabel: 'Brightness',
      engineerVolumeLabel: 'Volume',
      engineerApplyToDevice: 'Send to Device',
      engineerTestSound: 'Test Sound',
      engineerNeedConnect: 'Connect device first',
      engineerApplied: 'Parameters sent',
      displayCardTitle: 'Display',
      displayCardDesc: 'macOS-inspired soft lighting and glassy blur.',
      brightnessLabel: 'Brightness',
      brightnessHint: 'Adjust UI luminance',
      brightnessApplyFailed: 'Failed to set brightness. Check permission or backlight device.',
      screensaverLabel: 'Screen Saver',
      screensaverHint: 'Idle timeout before saver',
      soundTitle: 'Sound',
      volumeLabel: 'System Volume',
      volumeHint: 'Prompts and feedback',
      chimeLabel: 'Chime',
      chimeHint: 'Play prompts on key actions',
      languageTitle: 'Language',
      languageDesc: 'Switch between Chinese and English instantly.',
      languageLabel: 'Interface Language',
      languageHint: 'Preference',
      langZh: '中文',
      langEn: 'English',
      aboutTitle: 'About / Updates',
      aboutVersion: 'App Version',
      aboutFirmware: 'Firmware Version',
      aboutCheck: 'Check Updates',
      aboutLogs: 'Open Logs',
      currentStage: 'Stage',
      stageIdle: 'Idle',
      stageRising: 'Rising',
      stageHold: 'Hold',
      stagePulse: 'Pulse',
      modeLabelRise: 'Rising',
      modeLabelHold: 'Hold',
      modeLabelPulse: 'Pulse',
      shieldModalTitle: 'Shields Not Ready',
      shieldModalText: 'Please confirm both shields are worn and firmly connected.',
      shieldLostTitle: 'Shield Offline',
      shieldLostText: 'Shield disconnected, treatment stopped. Check fit and retry.',
      shieldLostBack: 'Back',
      shieldConfirmTitleLeft: 'Left Shield Issue',
      shieldConfirmTitleRight: 'Right Shield Issue',
      shieldConfirmTextLeft: 'Left channel fault detected. Continue treating right only?',
      shieldConfirmTextRight: 'Right channel fault detected. Continue treating left only?',
      confirmCancel: 'Cancel',
      confirmContinue: 'Continue',
      connected: 'Connected',
      disconnected: 'Disconnected',
      heartbeatTimeout: 'Heartbeat timeout, check device link',
      countdownDone: 'Session complete, stopped automatically',
      stoppedByDevice: 'Device stopped the session',
      shieldMissing: 'No shields detected. Please wear shields before starting.',
      checkingUpdates: 'Checking updates...',
      logsHint: 'Log opening is not wired yet',
    },
  };

let currentLang = 'zh';
const t = (key) => (TRANSLATIONS?.[currentLang] || TRANSLATIONS.zh)[key] || key;

const VIEWS = ['home', 'quick', 'settings', 'newPatient', 'patientList', 'report', 'reportArchive', 'engineer'];
const VIEW_CLASSES = VIEWS.map((v) => `view-${v}`);

  const MODE = { target: 20, t1: 25, t2: 35, t3: 50 };
  const TEMP_FIXED_C = 42.0;
  const AUTO_PORT = '/dev/ttyS1';
  const AUTO_BAUD = 115200;
  const audioMap = {
    shield: new Audio('../resoure/shield-is-invalid.wav'),
    start: new Audio('../resoure/Treatment-start.wav'),
    stop: new Audio('../resoure/Treatment-stop.wav'),
    tempHigh: new Audio('../resoure/Temperature-high.wav'),
  };
  const playSound = (key) => {
    if (!state.settings.playChime) return;
    const a = audioMap[key];
    if (!a || typeof a.play !== 'function') return;
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  };
  if (WEB_DEBUG) {
    console.log('[PPHC] web debug mode enabled - serial and device calls are stubbed');
  }

  const LOGIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin',
  };

  const KEYBOARD_LAYOUTS = {
    en: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Space', '←', 'Clear'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', '@', '.'],
    ],
    zh: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Space', '←', 'Clear'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    ],
  };
  const KEYBOARD_HOSTS = {
    default: { zone: 'default', oskId: 'osk', imeId: 'imeCandidates', keysId: 'oskKeys' },
    patient: {
      zone: 'patient',
      oskId: 'patientOsk',
      imeId: 'patientImeCandidates',
      keysId: 'patientOskKeys',
    },
  };
  const getKeyboardHost = (zone) => KEYBOARD_HOSTS[zone] || KEYBOARD_HOSTS.default;

  // 阶段文案：r 上升阶段，h 保持阶段，p 脉冲阶段
  const STAGE_LABELS = {
    r: 'modeLabelRise',
    h: 'modeLabelHold',
    p: 'modeLabelPulse',
  };
  const STAGE_CLASS = {
    r: 'stage-rising',
    h: 'stage-hold',
    p: 'stage-pulse',
  };

  const state = {
    loggedIn: false,
    user: { username: '', role: 'user' },
    connected: false,
    connecting: false,
    autoConnectTimer: null,
    heroClockTimer: null,
    mode: 1,
    running: false,
    countdownTimer: null,
    telemetryTimer: null,
    countdownEnd: 0,
    heartbeatTimer: null,
    heartbeatSeed: 0x55,
    lastHeartbeatAck: 0,
    buf: { 0: [], 1: [], 2: [], 3: [] },
    latest: { 0: null, 1: null, 2: null, 3: null },
    max: 360,
    currentView: 'home',
    settingsActiveModule: 'display',
    patients: [],
    patientsLoaded: false,
    activePatient: null,
    lastTreatment: null,
    selectedPatientId: null,
    treatmentPatientId: null,
    systemState: null,
    alarmState: null,
    shields: { left: false, right: false },
    shieldDetail: { leftPresent: null, rightPresent: null, leftFuse: null, rightFuse: null },
    shieldExplicit: false,
    pendingSides: null,
    activeSides: [],
    shieldDropShown: false,
    modeStage: '--',
    tempHighAlerted: false,
    settings: {
      brightness: 80,
      screensaver: 10,
      volume: 60,
      language: 'zh',
      autoConnect: true,
      appVersion: '0.1.0',
      firmwareVersion: '1.2.3',
      playChime: true,
      printerName: '',
    },
    targets: {
      pressure: null,
      temp: TEMP_FIXED_C,
      durationMin: null,
    },
  };

  const keyboardState = {
    lang: 'zh',
    target: null,
    zone: 'default',
    visible: false,
    composing: '',
    candidates: [],
    candidatePage: 0,
    dictLoading: false,
  };
  let backspaceRepeatTimer = null;
  let backspaceRepeatDelay = null;

  // Pinyin dictionary populated from @pinyin-pro/data (complete.json for max coverage)
  let PINYIN_INDEX = null;
  let PINYIN_PREFIX_INDEX = null;
  let PINYIN_LOAD_PROMISE = null;
  const PINYIN_DICT_URL = new URL(
    '../node_modules/@pinyin-pro/data/json/complete.json',
    window.location.href
  ).toString();


  let brightnessApplyTimer = null;
  let volumeApplyTimer = null;
  const clampBrightness = (val) => Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
  const clampVolume = (val) => Math.max(0, Math.min(100, Math.round(Number(val) || 0)));

  function showView(view) {
    const prev = state.currentView;
    const next = VIEWS.includes(view) ? view : 'home';
    state.currentView = next;
    const shell = document.querySelector('.app-shell');
    if (shell) shell.setAttribute('data-view', next);
    document.body.classList.remove(...VIEW_CLASSES);
    document.body.classList.add(`view-${next}`);
    if (prev !== next) hideKeyboard();
    if (next === 'settings') {
      updateSettingsUI();
      setSettingsModule(state.settingsActiveModule || 'display');
    } else if (next === 'quick') {
      ensurePatientsLoaded().then(() => {
        if (state.currentView === 'quick') renderQuickPatientPicker();
      });
      renderQuickPatientPicker();
    } else if (next === 'newPatient') {
      ensurePatientsLoaded();
      resetPatientForm();
    } else if (next === 'patientList') {
      ensurePatientsLoaded();
      renderPatientList();
    } else if (next === 'report') {
      renderReport();
    } else if (next === 'reportArchive') {
      loadReportArchive();
    } else if (next === 'engineer') {
      renderEngineer();
    }
    console.info('[PPHC] view ->', next);
  }

  function computeNextPatientId() {
    const nums = (state.patients || [])
      .map((p) => Number(String(p?.id || '').replace(/\D/g, '')))
      .filter((n) => Number.isFinite(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `P${String(next).padStart(4, '0')}`;
  }

  function setPatientIdValue() {
    const input = document.getElementById('patientId');
    if (!input) return null;
    const next = computeNextPatientId();
    input.value = next;
    return next;
  }

  function setPatientFormMessage(msg, isError = false) {
    const node = document.getElementById('patientFormMessage');
    if (!node) return;
    if (!msg) {
      node.hidden = true;
      node.textContent = '';
      node.classList.remove('error');
      return;
    }
    node.hidden = false;
    node.textContent = msg;
    node.classList.toggle('error', !!isError);
  }

  function resetPatientForm(clearMsg = true) {
    const idInput = document.getElementById('patientId');
    const nameInput = document.getElementById('patientName');
    const phoneInput = document.getElementById('patientPhone');
    const birthInput = document.getElementById('patientBirth');
    const notesInput = document.getElementById('patientNotes');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (birthInput) birthInput.value = '';
    if (notesInput) notesInput.value = '';
    const male = document.querySelector('input[name="patientGender"][value="男"]');
    if (male) male.checked = true;
    if (idInput) idInput.value = computeNextPatientId();
    if (clearMsg) setPatientFormMessage(null);
  }

  const datePickerState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selected: null,
    view: 'calendar',
  };

  function formatDateYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateYMD(str) {
    const m = String(str || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    if (Number.isNaN(dt.getTime())) return null;
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  function getWeekdayLabels() {
    return currentLang === 'en'
      ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      : ['日', '一', '二', '三', '四', '五', '六'];
  }

  function renderYearPicker() {
    const panel = document.getElementById('datePickerYearPanel');
    const listNode = document.getElementById('datePickerYearList');
    const titleNode = document.getElementById('datePickerYearTitle');
    const backBtn = document.getElementById('datePickerBack');
    if (!panel || !listNode) return;
    if (titleNode) titleNode.textContent = t('datePickerSelectYear');
    if (backBtn) backBtn.textContent = t('datePickerBack');
    listNode.innerHTML = '';

    const nowYear = new Date().getFullYear();
    const startYear = nowYear - 80;
    const endYear = nowYear + 10;
    for (let y = startYear; y <= endYear; y += 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'date-picker-year-item';
      if (y === datePickerState.year) btn.classList.add('selected');
      btn.textContent = String(y);
      btn.addEventListener('click', () => {
        datePickerState.year = y;
        datePickerState.view = 'calendar';
        renderDatePicker();
      });
      listNode.appendChild(btn);
    }

    // scroll current year into view
    const selected = listNode.querySelector('.date-picker-year-item.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'center' });
    }
  }

  function renderDatePicker() {
    const title = document.getElementById('datePickerTitle');
    const weekdaysNode = document.getElementById('datePickerWeekdays');
    const gridNode = document.getElementById('datePickerGrid');
    const actionsNode = document.querySelector('.date-picker-actions');
    const yearPanel = document.getElementById('datePickerYearPanel');
    if (!gridNode) return;
    const inYearView = datePickerState.view === 'year';
    if (yearPanel) yearPanel.hidden = !inYearView;
    if (weekdaysNode) weekdaysNode.hidden = inYearView;
    gridNode.hidden = inYearView;
    if (actionsNode) actionsNode.hidden = inYearView;
    if (inYearView) {
      renderYearPicker();
      return;
    }
    if (title) {
      const monthNum = String(datePickerState.month + 1).padStart(2, '0');
      title.textContent = `${datePickerState.year}-${monthNum}`;
    }
    if (weekdaysNode) {
      weekdaysNode.innerHTML = '';
      getWeekdayLabels().forEach((w) => {
        const el = document.createElement('div');
        el.textContent = w;
        weekdaysNode.appendChild(el);
      });
    }
    gridNode.innerHTML = '';
    const first = new Date(datePickerState.year, datePickerState.month, 1);
    const startWeekday = first.getDay();
    const start = new Date(datePickerState.year, datePickerState.month, 1 - startWeekday);
    const todayStr = formatDateYMD(new Date());

    for (let i = 0; i < 42; i += 1) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'date-picker-cell';
      const dtStr = formatDateYMD(dt);
      cell.textContent = String(dt.getDate());
      if (dt.getMonth() !== datePickerState.month) cell.classList.add('outside');
      if (dtStr === todayStr) cell.classList.add('today');
      if (datePickerState.selected && dtStr === datePickerState.selected) cell.classList.add('selected');
      cell.addEventListener('click', () => {
        datePickerState.selected = dtStr;
        const input = document.getElementById('patientBirth');
        if (input) input.value = dtStr;
        closeDatePicker();
      });
      gridNode.appendChild(cell);
    }

    const btnToday = document.getElementById('datePickerToday');
    const btnCancel = document.getElementById('datePickerCancel');
    if (btnToday) btnToday.textContent = t('datePickerToday');
    if (btnCancel) btnCancel.textContent = t('datePickerCancel');
  }

  function openDatePicker(initialValue) {
    const modal = document.getElementById('datePickerModal');
    if (!modal) return;
    const initDate = parseDateYMD(initialValue) || new Date();
    datePickerState.year = initDate.getFullYear();
    datePickerState.month = initDate.getMonth();
    datePickerState.selected = formatDateYMD(initDate);
    datePickerState.view = 'calendar';
    modal.hidden = false;
    renderDatePicker();
  }

  function closeDatePicker() {
    const modal = document.getElementById('datePickerModal');
    if (modal) modal.hidden = true;
  }

  function renderPatientList() {
    const listNode = document.getElementById('patientList');
    const emptyNode = document.getElementById('patientListEmpty');
    if (!listNode) return;
    listNode.innerHTML = '';
    const patients = Array.isArray(state.patients) ? state.patients : [];
    if (!patients.length) {
      if (emptyNode) emptyNode.hidden = false;
      return;
    }
    if (emptyNode) emptyNode.hidden = true;
    const table = document.createElement('div');
    table.className = 'patient-table';

    const headerRow = document.createElement('div');
    headerRow.className = 'patient-row header';
    const headerCells = [
      { key: 'patientId', className: 'id' },
      { key: 'patientName', className: 'name' },
      { key: 'patientGender', className: 'gender' },
      { key: 'patientPhone', className: 'phone' },
      { key: 'patientBirth', className: 'birth' },
      { key: 'patientNotes', className: 'notes' },
      { key: 'patientCreatedAt', className: 'created' },
    ];
    headerCells.forEach(({ key, className }) => {
      const cell = document.createElement('div');
      cell.className = `patient-cell ${className}`;
      cell.textContent = t(key);
      headerRow.appendChild(cell);
    });
    table.appendChild(headerRow);

    patients.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'patient-row';
      row.classList.toggle('selected', String(p.id || '') === String(state.selectedPatientId || ''));
      const created = p.createdAt ? (p.createdAt.split?.('T')?.[0] || p.createdAt) : '--';
      const values = {
        id: p.id || '--',
        name: p.name || '--',
        gender: p.gender || '--',
        phone: p.phone || '--',
        birth: p.birth || '--',
        notes: p.notes || '--',
        created,
      };
      ['id', 'name', 'gender', 'phone', 'birth', 'notes', 'created'].forEach((col) => {
        const cell = document.createElement('div');
        cell.className = `patient-cell ${col}`;
        cell.textContent = values[col];
        row.appendChild(cell);
      });
      row.addEventListener('click', () => {
        state.selectedPatientId = String(p.id || '');
        renderPatientList();
      });
      table.appendChild(row);
    });

    listNode.appendChild(table);
  }

  function getPatientById(id) {
    const key = String(id || '').trim();
    if (!key) return null;
    return (Array.isArray(state.patients) ? state.patients : []).find(
      (p) => String(p?.id || '').trim() === key
    );
  }

  function ensureTreatmentPatientSelected() {
    if (String(state.treatmentPatientId || '').trim()) return;
    const fromPatientList = String(state.selectedPatientId || '').trim();
    if (fromPatientList) {
      state.treatmentPatientId = fromPatientList;
      return;
    }
    const fromActive = String(state.activePatient?.id || '').trim();
    if (fromActive) {
      state.treatmentPatientId = fromActive;
      return;
    }
    const first = (Array.isArray(state.patients) ? state.patients : [])[0]?.id;
    if (first) state.treatmentPatientId = String(first);
  }

  function renderQuickPatientPicker() {
    const listNode = document.getElementById('quickPatientList');
    const selectedNode = document.getElementById('quickPatientSelected');
    if (!listNode && !selectedNode) return;
    if (listNode) setupDragScroll(listNode);

    const patients = Array.isArray(state.patients) ? state.patients : [];
    const sortedPatients = patients.slice().sort((a, b) => {
      const aTime = a?.createdAt ? Date.parse(a.createdAt) : NaN;
      const bTime = b?.createdAt ? Date.parse(b.createdAt) : NaN;
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return bTime - aTime;
      const aNum = Number(String(a?.id || '').replace(/\D/g, '')) || 0;
      const bNum = Number(String(b?.id || '').replace(/\D/g, '')) || 0;
      if (aNum !== bNum) return bNum - aNum;
      return String(b?.id || '').localeCompare(String(a?.id || ''));
    });
    ensureTreatmentPatientSelected();
    const activeId = String(state.treatmentPatientId || '').trim();
    const activePatient = activeId ? getPatientById(activeId) : null;

    if (selectedNode) {
      if (activePatient) {
        selectedNode.textContent = `${activePatient.id}${activePatient.name ? ` · ${activePatient.name}` : ''}`;
      } else if (activeId) {
        selectedNode.textContent = activeId;
      } else {
        selectedNode.textContent = t('quickPatientSelectedNone');
      }
    }

    if (!listNode) return;
    listNode.innerHTML = '';

    if (!sortedPatients.length) {
      listNode.innerHTML = `<div class="empty-tip">${t('quickPatientEmpty')}</div>`;
      return;
    }

    sortedPatients.forEach((p) => {
      const id = String(p?.id || '').trim();
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-patient-item';
      btn.classList.toggle('active', !!id && id === activeId);

      const idNode = document.createElement('strong');
      idNode.textContent = id || '--';
      const nameNode = document.createElement('span');
      nameNode.textContent = p?.name || '--';
      const meta = document.createElement('small');
      meta.textContent = [p?.gender, p?.phone].filter(Boolean).join(' · ') || '—';

      btn.append(idNode, nameNode, meta);
      btn.addEventListener('click', () => {
        state.treatmentPatientId = id || null;
        renderQuickPatientPicker();
      });
      listNode.appendChild(btn);
    });
  }

  const REPORT_TIPS = {
    zh: [
      '治疗后 24 小时内避免揉眼，减少长时间用眼。',
      '可按医嘱配合热敷、睑缘清洁及人工泪液使用。',
      '使用电子屏幕时注意增加眨眼频率，每 20 分钟远眺 20 秒。',
      '室内保持适当湿度，避免空调或风扇直吹。',
      '饮食清淡，适量补充富含 ω‑3 脂肪酸食物。',
      '如出现明显疼痛、视力下降或分泌物增多，请及时复诊。',
    ],
    en: [
      'Avoid rubbing eyes within 24 hours after treatment and reduce prolonged screen time.',
      'Follow clinician instructions for warm compresses, lid hygiene, and artificial tears.',
      'Blink more when using screens; look away for 20 seconds every 20 minutes.',
      'Maintain indoor humidity and avoid direct air from AC/fans.',
      'Keep a balanced diet and consider omega‑3 rich foods as advised.',
      'Seek medical review if pain, vision drop, or discharge increases.',
    ],
  };

  const REPORT_DISCLAIMER = {
    zh: [
      '本报告为设备自动生成的治疗记录，用于临床随访与健康管理参考。',
      '报告内容不构成独立医学诊断，不能替代医生的临床判断。',
      '请遵医嘱进行后续护理与复查，如症状持续或加重请及时就诊。',
    ].join('\n'),
    en: [
      'This report is an automatically generated treatment record for follow‑up and care reference.',
      'It does not constitute an independent medical diagnosis nor replace clinician judgment.',
      'Follow clinician instructions and return for review if symptoms persist or worsen.',
    ].join('\n'),
  };

  function openReportForPatient(patient) {
    if (!patient) return;
    state.activePatient = patient;
    showView('report');
  }

  function appendReportField(gridNode, label, value, opts = {}) {
    if (!gridNode) return;
    const field = document.createElement('div');
    field.className = `report-field${opts.full ? ' full' : ''}`;
    const labelNode = document.createElement('div');
    labelNode.className = 'report-label';
    labelNode.textContent = label;
    const valueNode = document.createElement('div');
    valueNode.className = 'report-value';
    valueNode.textContent = value || '--';
    field.append(labelNode, valueNode);
    gridNode.appendChild(field);
  }

  function renderReport() {
    const patient = state.activePatient;
    const headerTitle = document.getElementById('reportHeaderTitle');
    if (headerTitle) headerTitle.textContent = `${t('homeTitle')} ${t('reportSuffix')}`;
    const screenTitle = document.getElementById('reportScreenTitle');
    if (screenTitle) screenTitle.textContent = t('reportScreenTitle');
    const generatedAtNode = document.getElementById('reportGeneratedAt');
    if (generatedAtNode) {
      generatedAtNode.textContent = `${t('reportGeneratedAtLabel')}: ${new Date().toLocaleString()}`;
    }

    const patientGrid = document.getElementById('reportPatientInfoGrid');
    if (patientGrid) {
      patientGrid.innerHTML = '';
      appendReportField(patientGrid, t('patientId'), patient?.id || '--');
      appendReportField(patientGrid, t('patientName'), patient?.name || '--');
      appendReportField(patientGrid, t('patientGender'), patient?.gender || '--');
      appendReportField(patientGrid, t('patientPhone'), patient?.phone || '--');
      appendReportField(patientGrid, t('patientBirth'), patient?.birth || '--');
      const created = patient?.createdAt
        ? new Date(patient.createdAt).toLocaleDateString()
        : '--';
      appendReportField(patientGrid, t('patientCreatedAt'), created);
      appendReportField(patientGrid, t('patientNotes'), patient?.notes || '--', { full: true });
    }

    const treatGrid = document.getElementById('reportTreatmentInfoGrid');
    if (treatGrid) {
      treatGrid.innerHTML = '';
      const pressureMmHg =
        state.lastTreatment?.pressureMmHg ??
        state.targets.pressure ??
        Number(document.getElementById('pressMmHg')?.value ?? 0);
      const durationMin =
        state.lastTreatment?.durationMin ??
        (state.user?.role === 'engineer' && Number.isFinite(Number(state.targets.durationMin))
          ? Number(state.targets.durationMin)
          : Number(document.getElementById('treatDuration')?.value ?? 0));
      const modeVal = state.lastTreatment?.mode ?? state.mode ?? 1;
      const sides = state.lastTreatment?.sides || state.activeSides || [];
      const tempC =
        state.lastTreatment?.tempC ??
        (Number.isFinite(Number(state.targets.temp)) ? Number(state.targets.temp) : TEMP_FIXED_C);
      const sidesText = sides.length
        ? sides
            .map((s) => (s === 'left' ? t('leftEye') : t('rightEye')))
            .join(' / ')
        : '--';
      appendReportField(
        treatGrid,
        t('reportPressureLabel'),
        pressureMmHg ? `${pressureMmHg} mmHg` : '--'
      );
      appendReportField(
        treatGrid,
        t('reportDurationLabel'),
        durationMin ? `${durationMin} min` : '--'
      );
      appendReportField(treatGrid, t('reportTempLabel'), `${tempC} ℃`);
      appendReportField(treatGrid, t('reportModeLabel'), String(modeVal));
      appendReportField(treatGrid, t('reportSidesLabel'), sidesText);
      const startedAt = state.lastTreatment?.startedAt
        ? new Date(state.lastTreatment.startedAt).toLocaleString()
        : '--';
      appendReportField(treatGrid, t('reportStartTimeLabel'), startedAt);
    }

    const tipsList = document.getElementById('reportTipsList');
    if (tipsList) {
      tipsList.innerHTML = '';
      const tips = REPORT_TIPS[currentLang] || REPORT_TIPS.zh;
      tips.forEach((tip) => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
      });
    }

    const disclaimerNode = document.getElementById('reportDisclaimerText');
    if (disclaimerNode) {
      disclaimerNode.textContent = REPORT_DISCLAIMER[currentLang] || REPORT_DISCLAIMER.zh;
    }

    const patientTitle = document.getElementById('reportPatientInfoTitle');
    if (patientTitle) patientTitle.textContent = t('reportPatientInfoTitle');
    const treatmentTitle = document.getElementById('reportTreatmentInfoTitle');
    if (treatmentTitle) treatmentTitle.textContent = t('reportTreatmentInfoTitle');
    const tipsTitle = document.getElementById('reportTipsTitle');
    if (tipsTitle) tipsTitle.textContent = t('reportTipsTitle');
    const disclaimerTitle = document.getElementById('reportDisclaimerTitle');
    if (disclaimerTitle) disclaimerTitle.textContent = t('reportDisclaimerTitle');
    const signNode = document.getElementById('reportDoctorSign');
    if (signNode) signNode.textContent = t('reportDoctorSign');
    const dateNode = document.getElementById('reportDoctorDate');
    if (dateNode) dateNode.textContent = t('reportDoctorDate');
    const exportBtn = document.getElementById('btnExportPdf');
    if (exportBtn) exportBtn.textContent = t('exportPdf');
    const printBtn = document.getElementById('btnPrintReport');
    if (printBtn) printBtn.textContent = t('printReport');
  }

  async function handleExportReportPdf() {
    showAlert(t('exportingPdf'), 2000, 'info');
    try {
      const res = api?.exportReportPdf
        ? await api.exportReportPdf({
            patientId: state.activePatient?.id || '',
          })
        : null;
      if (res?.success) {
        const filePath = String(res.filePath || '');
        const base = filePath.split(/[\\/]/).filter(Boolean).pop() || '';
        const hint = base ? `reports/${base}` : 'reports/';
        showAlert(`${t('exportPdfSuccess')}: ${hint}`, 6000, 'success');
      } else {
        const reason = res?.failureReason ? `: ${res.failureReason}` : '';
        showAlert(`${t('exportPdfFailed')}${reason}`, 4500, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] export pdf failed', err);
      showAlert(t('exportPdfFailed'), 4500, 'error');
    }
  }

  let reportArchiveCache = [];
  let activeReportUrl = null;

  function renderReportArchiveList() {
    const listNode = document.getElementById('reportArchiveList');
    if (!listNode) return;
    listNode.innerHTML = '';
    if (!reportArchiveCache.length) {
      listNode.innerHTML = `<div class="empty-tip">${t('reportArchiveEmpty')}</div>`;
      return;
    }
    reportArchiveCache.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'log-item';
      const title = document.createElement('span');
      title.textContent = item.name;
      const meta = document.createElement('small');
      const when = item.mtimeMs ? new Date(item.mtimeMs).toLocaleString() : '';
      const size = typeof item.size === 'number' ? `${Math.round(item.size / 1024)} KB` : '';
      meta.textContent = [when, size, item.patientId].filter(Boolean).join(' · ');
      btn.append(title, meta);
      btn.classList.toggle('active', item.url === activeReportUrl);
      btn.addEventListener('click', () => selectReportArchive(item.url));
      listNode.appendChild(btn);
    });
  }

  function selectReportArchive(url) {
    activeReportUrl = url || null;
    renderReportArchiveList();
    const viewer = document.getElementById('reportArchiveViewer');
    if (viewer) viewer.src = activeReportUrl || 'about:blank';
  }

  function getActiveReportName() {
    const found = reportArchiveCache.find((r) => r.url === activeReportUrl);
    return found?.name || reportArchiveCache[0]?.name || null;
  }

  async function handlePrintArchiveReport() {
    const printerName = state.settings.printerName || '';
    if (!printerName) {
      showAlert(t('printNoPrinter'), 4500, 'error');
      return;
    }
    const name = getActiveReportName();
    if (!name) return;
    showAlert(t('printingReport'), 2500, 'info');
    try {
      const res = api?.printReportPdf ? await api.printReportPdf({ name, printerName }) : null;
      if (res?.success) {
        showAlert(t('printSuccess'), 5000, 'success');
      } else {
        const reason = res?.failureReason ? `: ${res.failureReason}` : '';
        showAlert(`${t('printFailed')}${reason}`, 5000, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] print report pdf failed', err);
      showAlert(t('printFailed'), 5000, 'error');
    }
  }

  async function handleDeleteSelectedPatient() {
    const id = String(state.selectedPatientId || '').trim();
    if (!id) {
      showAlert(t('patientDeleteNeedSelect'), 3500, 'error');
      return;
    }
    try {
      const res = api?.removePatient ? await api.removePatient(id) : null;
      if (res?.success) {
        state.selectedPatientId = null;
        await ensurePatientsLoaded();
        state.patients = state.patients.filter((p) => String(p?.id || '').trim() !== id);
        if (String(state.treatmentPatientId || '').trim() === id) state.treatmentPatientId = null;
        renderPatientList();
        renderQuickPatientPicker();
        showAlert(t('patientDeleted'), 3500, 'success');
      } else {
        showAlert(t('patientDeleteFailed'), 3500, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] delete patient failed', err);
      showAlert(t('patientDeleteFailed'), 3500, 'error');
    }
  }

  async function handleClearPatients() {
    try {
      const res = api?.clearPatients ? await api.clearPatients() : null;
      if (res?.success) {
        state.selectedPatientId = null;
        state.treatmentPatientId = null;
        state.patients = [];
        state.patientsLoaded = true;
        renderPatientList();
        renderQuickPatientPicker();
        showAlert(t('patientsCleared'), 3500, 'success');
      } else {
        showAlert(t('patientsClearFailed'), 3500, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] clear patients failed', err);
      showAlert(t('patientsClearFailed'), 3500, 'error');
    }
  }

  async function handleDeleteSelectedReport() {
    const name = getActiveReportName();
    if (!name) {
      showAlert(t('reportDeleteNeedSelect'), 3500, 'error');
      return;
    }
    try {
      const res = api?.removeReport ? await api.removeReport(name) : null;
      if (res?.success) {
        await loadReportArchive();
        showAlert(t('reportDeleted'), 3500, 'success');
      } else {
        showAlert(t('reportDeleteFailed'), 3500, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] delete report failed', err);
      showAlert(t('reportDeleteFailed'), 3500, 'error');
    }
  }

  async function handleClearReports() {
    try {
      const res = api?.clearReports ? await api.clearReports() : null;
      if (res?.success) {
        await loadReportArchive();
        showAlert(t('reportsCleared'), 3500, 'success');
      } else {
        showAlert(t('reportsClearFailed'), 3500, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] clear reports failed', err);
      showAlert(t('reportsClearFailed'), 3500, 'error');
    }
  }

  async function loadReportArchive(filter = {}) {
    const viewer = document.getElementById('reportArchiveViewer');
    if (viewer) viewer.src = 'about:blank';
    try {
      const list = api?.listReports ? await api.listReports(filter) : [];
      reportArchiveCache = Array.isArray(list) ? list : [];
      activeReportUrl = reportArchiveCache[0]?.url || null;
      renderReportArchiveList();
      if (activeReportUrl) selectReportArchive(activeReportUrl);
    } catch (err) {
      console.warn('[PPHC] load report archive failed', err);
      reportArchiveCache = [];
      activeReportUrl = null;
      renderReportArchiveList();
    }
  }

  function renderEngineer() {
    const title = document.getElementById('engineerTitle');
    if (title) title.textContent = t('engineerTitle');
    const paramsTitle = document.getElementById('engineerParamsTitle');
    if (paramsTitle) paramsTitle.textContent = t('engineerParamsTitle');
    const testTitle = document.getElementById('engineerTestTitle');
    if (testTitle) testTitle.textContent = t('engineerTestTitle');
    const labels = {
      engineerPressureLabel: 'engineerPressureLabel',
      engineerDurationLabel: 'engineerDurationLabel',
      engineerTempLabel: 'engineerTempLabel',
      engineerBrightnessLabel: 'engineerBrightnessLabel',
      engineerVolumeLabel: 'engineerVolumeLabel',
    };
    Object.entries(labels).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t(key);
    });
    const applyBtn = document.getElementById('btnEngineerApplyToDevice');
    if (applyBtn) applyBtn.textContent = t('engineerApplyToDevice');
    const soundBtn = document.getElementById('btnEngineerTestSound');
    if (soundBtn) soundBtn.textContent = t('engineerTestSound');

    const mmHg = Number(document.getElementById('pressMmHg')?.value ?? state.targets.pressure ?? 250);
    const min =
      Number.isFinite(Number(state.targets.durationMin))
        ? Number(state.targets.durationMin)
        : Number(document.getElementById('treatDuration')?.value ?? 10);
    const temp = Number.isFinite(Number(state.targets.temp)) ? Number(state.targets.temp) : TEMP_FIXED_C;

    const p = document.getElementById('engineerPressure');
    if (p) p.value = String(Math.max(0, Math.min(400, Math.round(mmHg))));
    const pv = document.getElementById('engineerPressureValue');
    if (pv) pv.textContent = `${Math.round(mmHg)} mmHg`;

    const d = document.getElementById('engineerDuration');
    if (d) d.value = String(Math.max(1, Math.min(30, Math.round(min))));
    const dv = document.getElementById('engineerDurationValue');
    if (dv) dv.textContent = `${Math.round(min)} min`;

    const tSlider = document.getElementById('engineerTemp');
    if (tSlider) tSlider.value = String(Math.max(35, Math.min(45, temp)));
    const tv = document.getElementById('engineerTempValue');
    if (tv) tv.textContent = `${temp.toFixed(1)} ℃`;

    const b = document.getElementById('engineerBrightness');
    if (b) b.value = String(clampBrightness(state.settings.brightness));
    const bv = document.getElementById('engineerBrightnessValue');
    if (bv) bv.textContent = `${clampBrightness(state.settings.brightness)}%`;

    const v = document.getElementById('engineerVolume');
    if (v) v.value = String(clampVolume(state.settings.volume));
    const vv = document.getElementById('engineerVolumeValue');
    if (vv) vv.textContent = `${clampVolume(state.settings.volume)}%`;
  }

  function bindEngineerControls() {
    const p = document.getElementById('engineerPressure');
    if (p) {
      p.addEventListener('input', () => {
        const mmHg = Math.max(0, Math.min(400, Math.round(Number(p.value || 0))));
        const pv = document.getElementById('engineerPressureValue');
        if (pv) pv.textContent = `${mmHg} mmHg`;
        const quickP = document.getElementById('pressMmHg');
        if (quickP) quickP.value = String(mmHg);
        const chip = document.getElementById('pressMmHgValue');
        if (chip) chip.textContent = `${mmHg} mmHg`;
        state.targets.pressure = mmHg;
      });
    }
    const d = document.getElementById('engineerDuration');
    if (d) {
      d.addEventListener('input', () => {
        const min = Math.max(1, Math.min(30, Math.round(Number(d.value || 10))));
        const dv = document.getElementById('engineerDurationValue');
        if (dv) dv.textContent = `${min} min`;
        state.targets.durationMin = min;
        const quickD = document.getElementById('treatDuration');
        if (quickD) quickD.value = String(Math.max(1, Math.min(15, min)));
        const durationNode = document.getElementById('durationValue');
        if (durationNode) durationNode.textContent = `${Math.max(1, Math.min(15, min))} min`;
      });
    }
    const tSlider = document.getElementById('engineerTemp');
    if (tSlider) {
      tSlider.addEventListener('input', () => {
        const temp = Math.max(35, Math.min(45, Number(tSlider.value || TEMP_FIXED_C)));
        state.targets.temp = Number(temp.toFixed(1));
        const tv = document.getElementById('engineerTempValue');
        if (tv) tv.textContent = `${state.targets.temp.toFixed(1)} ℃`;
      });
    }
    const b = document.getElementById('engineerBrightness');
    if (b) {
      b.addEventListener('input', () => {
        requestBrightnessApply(b.value);
        const bv = document.getElementById('engineerBrightnessValue');
        if (bv) bv.textContent = `${clampBrightness(b.value)}%`;
      });
    }
    const v = document.getElementById('engineerVolume');
    if (v) {
      v.addEventListener('input', () => {
        requestVolumeApply(v.value);
        const vv = document.getElementById('engineerVolumeValue');
        if (vv) vv.textContent = `${clampVolume(v.value)}%`;
      });
    }
    document.getElementById('btnEngineerTestSound')?.addEventListener('click', () => {
      playSound('start');
    });
    document.getElementById('btnEngineerApplyToDevice')?.addEventListener('click', () => {
      if (!state.connected) {
        showAlert(t('engineerNeedConnect'));
        return;
      }
      const mmHg = Math.max(0, Math.min(400, Math.round(Number(p?.value || 0))));
      const min = Math.max(1, Math.min(30, Math.round(Number(d?.value || 10))));
      state.targets.durationMin = min;
      const temp = Number.isFinite(Number(state.targets.temp)) ? Number(state.targets.temp) : TEMP_FIXED_C;
      api?.sendF32?.(0x1001, mmHg);
      api?.sendF32?.(0x1002, temp);
      api?.sendU16?.(0x1006, min);
      showAlert(t('engineerApplied'));
    });
  }

  async function handlePrintReport() {
    const printerName = state.settings.printerName || '';
    if (!printerName) {
      showAlert(t('printNoPrinter'));
      return;
    }
    if (/pdf/i.test(printerName)) {
      await handleExportReportPdf();
      return;
    }
    showAlert(t('printingReport'), 2500, 'info');
    try {
      const res = api?.printReport ? await api.printReport({ printerName }) : null;
      if (res?.success) {
        showAlert(t('printSuccess'), 5000, 'success');
      } else {
        const reason = res?.failureReason ? `: ${res.failureReason}` : '';
        showAlert(`${t('printFailed')}${reason}`, 5000, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] print failed', err);
      showAlert(t('printFailed'), 5000, 'error');
    }
  }

  async function loadPatients() {
    if (!api?.getPatients) {
      state.patients = [];
      state.patientsLoaded = true;
      resetPatientForm();
      renderPatientList();
      renderQuickPatientPicker();
      return;
    }
    try {
      const list = await api.getPatients();
      state.patients = Array.isArray(list) ? list : [];
      state.patientsLoaded = true;
      resetPatientForm();
      renderPatientList();
      renderQuickPatientPicker();
    } catch (err) {
      console.warn('[PPHC] load patients failed', err);
      showAlert(t('patientLoadFailed'));
    }
  }

  async function ensurePatientsLoaded() {
    if (state.patientsLoaded) return state.patients;
    await loadPatients();
    return state.patients;
  }

  async function handlePatientSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('patientName');
    const phoneInput = document.getElementById('patientPhone');
    const birthInput = document.getElementById('patientBirth');
    const notesInput = document.getElementById('patientNotes');
    const genderInput = document.querySelector('input[name="patientGender"]:checked');
    const name = nameInput?.value?.trim() || '';
    if (!name) {
      setPatientFormMessage(t('patientNameRequired'), true);
      return;
    }
    setPatientFormMessage(null);
    await ensurePatientsLoaded();
    try {
      const payload = {
        name,
        phone: phoneInput?.value?.trim() || '',
        birth: birthInput?.value || '',
        notes: notesInput?.value?.trim() || '',
        gender: genderInput?.value || '男',
      };
      const saved = api?.addPatient
        ? await api.addPatient(payload)
        : { ...payload, id: computeNextPatientId(), createdAt: new Date().toISOString() };
      if (saved && saved.id) {
        state.patients = [...state.patients, saved];
        state.patientsLoaded = true;
        renderPatientList();
        renderQuickPatientPicker();
        resetPatientForm();
        setPatientFormMessage(t('patientSaved'));
        showView('patientList');
      } else {
        setPatientFormMessage(t('patientSaveFailed'), true);
      }
    } catch (err) {
      console.error('[PPHC] save patient failed', err);
      setPatientFormMessage(t('patientSaveFailed'), true);
    }
  }

  const getPressureTarget = () => {
    const sliderVal = Number(document.getElementById('pressMmHg')?.value || 0);
    if (state.running && Number.isFinite(state.targets.pressure)) return state.targets.pressure;
    return sliderVal;
  };

  const getTempTarget = () => {
    if (Number.isFinite(state.targets.temp)) return state.targets.temp;
    return TEMP_FIXED_C;
  };

  const sparkTargets = [
    {
      key: 0,
      canvas: () => $('#sparkPressureLeft'),
      color: 'rgba(53,209,192,0.9)',
      yMin: 0,
      yMax: 700,
      target: () => getPressureTarget(),
    },
    {
      key: 2,
      canvas: () => $('#sparkPressureRight'),
      color: 'rgba(245,165,36,0.9)',
      yMin: 0,
      yMax: 700,
      target: () => getPressureTarget(),
    },
    {
      key: 1,
      canvas: () => $('#sparkTempLeft'),
      color: 'rgba(59,130,246,0.9)',
      visibleMax: 60,
      target: () => getTempTarget(),
    },
    {
      key: 3,
      canvas: () => $('#sparkTempRight'),
      color: 'rgba(239,68,68,0.9)',
      visibleMax: 60,
      target: () => getTempTarget(),
    },
  ];

  function getKeyboardTarget() {
    if (keyboardState.target && document.body.contains(keyboardState.target)) {
      return keyboardState.target;
    }
    keyboardState.target = document.querySelector('.login-input') || document.querySelector('.osk-input');
    return keyboardState.target;
  }

  function focusEnd(target) {
    if (!target) return;
    const len = target.value.length;
    if (typeof target.setSelectionRange === 'function') {
      target.focus();
      target.setSelectionRange(len, len);
    }
  }

  function insertTextAtCursor(target, text) {
    if (!target) return;
    if (document.activeElement !== target) {
      focusEnd(target);
    }
    const start = typeof target.selectionStart === 'number' ? target.selectionStart : target.value.length;
    const end = typeof target.selectionEnd === 'number' ? target.selectionEnd : target.value.length;
    const before = target.value.slice(0, start);
    const after = target.value.slice(end);
    target.value = `${before}${text}${after}`;
    const pos = target.value.length;
    if (typeof target.setSelectionRange === 'function') {
      target.setSelectionRange(pos, pos);
    }
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function insertTextAtEnd(target, text) {
    if (!target) return;
    target.focus();
    const end = target.value.length;
    target.value = `${target.value}${text}`;
    if (typeof target.setSelectionRange === 'function') {
      target.setSelectionRange(end + text.length, end + text.length);
    }
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function hideKeyboard() {
    keyboardState.visible = false;
    Object.values(KEYBOARD_HOSTS).forEach(({ oskId, imeId }) => {
      const osk = document.getElementById(oskId);
      if (osk) osk.classList.add('osk-hidden');
      const ime = document.getElementById(imeId);
      if (ime) ime.classList.add('osk-hidden');
    });
    document.body.classList.remove('keyboard-open');
  }

  function showKeyboard() {
    const host = getKeyboardHost(keyboardState.zone);
    keyboardState.visible = true;
    Object.values(KEYBOARD_HOSTS).forEach((cfg) => {
      const osk = document.getElementById(cfg.oskId);
      if (osk) {
        if (cfg === host) osk.classList.remove('osk-hidden');
        else osk.classList.add('osk-hidden');
      }
    });
    document.body.classList.add('keyboard-open');
  }

  function handleKeyboardAction(action) {
    const target = getKeyboardTarget();
    if (!target) return;
    const actionKey = action?.toLowerCase?.() || action;
    const isSpaceKey = actionKey === 'space' || actionKey === '空格';
    const isBackspaceKey =
      actionKey === 'backspace' || actionKey === '退格' || actionKey === '←';

    if (keyboardState.lang === 'zh') {
      if (action === 'enter') {
        const cand = keyboardState.candidates?.[0] || keyboardState.composing;
        if (cand) commitCandidate(cand);
        else attemptLogin();
        return;
      }
      if (isBackspaceKey) {
        if (keyboardState.composing) {
          keyboardState.composing = keyboardState.composing.slice(0, -1);
          if (keyboardState.composing.length === 0) {
            keyboardState.candidatePage = 0;
          }
          renderImeCandidates();
          return;
        }
        // no composing text, delete from input end
      }
      if (action === 'clear') {
        keyboardState.composing = '';
        keyboardState.candidates = [];
        keyboardState.candidatePage = 0;
        renderImeCandidates();
        target.value = '';
        target.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }
    switch (action) {
      case 'space':
      case '空格':
        insertTextAtCursor(target, ' ');
        keyboardState.composing = '';
        keyboardState.candidates = [];
        keyboardState.candidatePage = 0;
        renderImeCandidates();
        break;
      case 'clear':
        target.value = '';
        if (typeof target.setSelectionRange === 'function') target.setSelectionRange(0, 0);
        target.dispatchEvent(new Event('input', { bubbles: true }));
        break;
      case 'backspace':
      case '退格': {
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        if (start === end && start > 0) {
          const next = target.value.slice(0, start - 1) + target.value.slice(end);
          target.value = next;
          const pos = start - 1;
          if (typeof target.setSelectionRange === 'function') target.setSelectionRange(pos, pos);
        } else if (start !== end) {
          const next = target.value.slice(0, start) + target.value.slice(end);
          target.value = next;
          if (typeof target.setSelectionRange === 'function') target.setSelectionRange(start, start);
        }
        target.dispatchEvent(new Event('input', { bubbles: true }));
        break;
      }
      case 'enter':
        attemptLogin();
        break;
      default:
        break;
    }
  }

  function renderKeyboardKeys() {
    const rows = KEYBOARD_LAYOUTS[keyboardState.lang] || KEYBOARD_LAYOUTS.zh;
    Object.values(KEYBOARD_HOSTS).forEach(({ keysId }) => {
      const keysWrap = document.getElementById(keysId);
      if (!keysWrap) return;
      keysWrap.innerHTML = '';
      rows.forEach((row) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'osk-row';
        row.forEach((label) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'osk-key';
          btn.textContent = label;
          const keyLower = String(label || '').toLowerCase();
          if (keyLower === '←' || keyLower === 'backspace' || keyLower === '退格') {
            btn.addEventListener('pointerdown', (e) => {
              e.preventDefault();
              startBackspaceRepeat();
            });
            btn.addEventListener('pointerup', () => stopBackspaceRepeat());
            btn.addEventListener('pointerleave', () => stopBackspaceRepeat());
          } else {
            btn.addEventListener('click', () => {
              handleKeyboardKey(label);
            });
          }
          rowEl.appendChild(btn);
        });
        keysWrap.appendChild(rowEl);
      });
    });
  }

  function setKeyboardLang(lang) {
    const next = lang === 'en' ? 'en' : 'zh';
    keyboardState.lang = next;
    keyboardState.composing = '';
    keyboardState.candidates = [];
    keyboardState.candidatePage = 0;
    renderImeCandidates();
    document.querySelectorAll('.osk-lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === next);
    });
    renderKeyboardKeys();
  }

  function stopBackspaceRepeat() {
    if (backspaceRepeatTimer) {
      clearInterval(backspaceRepeatTimer);
      backspaceRepeatTimer = null;
    }
    if (backspaceRepeatDelay) {
      clearTimeout(backspaceRepeatDelay);
      backspaceRepeatDelay = null;
    }
  }

  function startBackspaceRepeat() {
    handleKeyboardAction('backspace');
    stopBackspaceRepeat();
    backspaceRepeatDelay = setTimeout(() => {
      backspaceRepeatTimer = setInterval(() => {
        handleKeyboardAction('backspace');
      }, 220);
    }, 400);
  }

  function stopBackspaceRepeat() {
    if (backspaceRepeatTimer) {
      clearInterval(backspaceRepeatTimer);
      backspaceRepeatTimer = null;
    }
  }

  function startBackspaceRepeat() {
    handleKeyboardAction('backspace');
    stopBackspaceRepeat();
    backspaceRepeatTimer = setInterval(() => {
      handleKeyboardAction('backspace');
    }, 120);
  }

  function bindKeyboardControls() {
    document.querySelectorAll('.osk-lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setKeyboardLang(btn.dataset.lang);
      });
    });
    document.querySelectorAll('.osk-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        handleKeyboardAction(btn.dataset.action);
      });
    });
  }

  const TONE_MAP = {
    ā: 'a', á: 'a', ǎ: 'a', à: 'a',
    ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
    ē: 'e', é: 'e', ě: 'e', è: 'e',
    ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
    ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
    ǖ: 'v', ǘ: 'v', ǚ: 'v', ǜ: 'v', ü: 'v',
    Ā: 'a', Á: 'a', Ǎ: 'a', À: 'a',
    Ō: 'o', Ó: 'o', Ǒ: 'o', Ò: 'o',
    Ē: 'e', É: 'e', Ě: 'e', È: 'e',
    Ī: 'i', Í: 'i', Ǐ: 'i', Ì: 'i',
    Ū: 'u', Ú: 'u', Ǔ: 'u', Ù: 'u',
    Ǖ: 'v', Ǘ: 'v', Ǚ: 'v', Ǜ: 'v', Ü: 'v',
  };

  function normalizePinyinKey(pyStr) {
    const raw = String(pyStr || '');
    let out = '';
    for (let i = 0; i < raw.length; i += 1) {
      const ch = raw[i];
      out += TONE_MAP[ch] || ch;
    }
    return out.replace(/\s+/g, '').toLowerCase();
  }

  async function loadPinyinIndex() {
    if (PINYIN_LOAD_PROMISE) return PINYIN_LOAD_PROMISE;
    keyboardState.dictLoading = true;
    renderImeCandidates();
    const insertCandidate = (map, key, word, freq, cap = 100) => {
      const arr = map[key] || [];
      arr.push({ word, freq });
      arr.sort((a, b) => (b.freq || 0) - (a.freq || 0));
      if (arr.length > cap) arr.length = cap; // keep top candidates per key to bound memory
      map[key] = arr;
    };

    PINYIN_LOAD_PROMISE = fetch(PINYIN_DICT_URL)
      .then((res) => res.json())
      .then(async (json) => {
        const map = {};
        const prefixMap = {};
        const entries = Object.entries(json || {});
        const chunk = 800;
        for (let idx = 0; idx < entries.length; idx += chunk) {
          const end = Math.min(idx + chunk, entries.length);
          for (let i = idx; i < end; i += 1) {
            const [word, val] = entries[i];
            const py = Array.isArray(val) ? val[0] : null;
            const freq = Array.isArray(val) ? val[1] || 0 : 0;
            if (!py || !word) continue;
            const key = normalizePinyinKey(py);
            if (!key) continue;
            insertCandidate(map, key, word, freq, 100);
            const maxPrefix = Math.min(6, key.length);
            for (let l = 1; l <= maxPrefix; l += 1) {
              const pref = key.slice(0, l);
              insertCandidate(prefixMap, pref, word, freq, 80);
            }
          }
          if (end < entries.length) {
            // yield to UI thread to avoid stutter
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }
        PINYIN_INDEX = map;
        PINYIN_PREFIX_INDEX = prefixMap;
      })
      .catch((err) => {
        console.warn('[IME] load pinyin dict failed', err);
        PINYIN_INDEX = {};
        PINYIN_PREFIX_INDEX = {};
      })
      .finally(() => {
        keyboardState.dictLoading = false;
        renderImeCandidates();
      });
    return PINYIN_LOAD_PROMISE;
  }

  function findPinyinCandidates(buffer) {
    const buf = String(buffer || '').toLowerCase();
    if (!buf) return [];
    if (!PINYIN_INDEX) {
      loadPinyinIndex().then(() => renderImeCandidates());
      return keyboardState.dictLoading ? [] : [buf];
    }
    const exact = PINYIN_INDEX[buf] || [];
    if (exact.length) return exact.map((e) => e.word);
    const pref = PINYIN_PREFIX_INDEX?.[buf] || [];
    if (pref.length) return pref.map((e) => e.word);
    const extendedKeys = Object.keys(PINYIN_INDEX || {}).filter((k) => k.startsWith(buf));
    if (extendedKeys.length) {
      const extended = extendedKeys
        .slice(0, 200)
        .flatMap((k) => PINYIN_INDEX[k] || [])
        .slice(0, 200);
      if (extended.length) return extended.map((e) => e.word);
    }
    return [buf];
  }

  function renderImeCandidates() {
    const host = getKeyboardHost(keyboardState.zone);
    const wrap = document.getElementById(host.imeId);
    if (!wrap) return;
    Object.values(KEYBOARD_HOSTS).forEach(({ imeId }) => {
      if (imeId === host.imeId) return;
      const other = document.getElementById(imeId);
      if (other) {
        other.classList.add('osk-hidden');
        other.innerHTML = '';
      }
    });
    if (keyboardState.lang !== 'zh' || !keyboardState.composing) {
      wrap.classList.add('osk-hidden');
      wrap.innerHTML = '';
      keyboardState.candidates = [];
      keyboardState.candidatePage = 0;
      return;
    }
    wrap.classList.remove('osk-hidden');
    wrap.innerHTML = '';
    const buffer = keyboardState.composing.toLowerCase();
    const top = findPinyinCandidates(buffer);
    keyboardState.candidates = top;

    // Auto-commit when only one real candidate exists (not the raw pinyin buffer).
    if (
      !keyboardState.dictLoading &&
      Array.isArray(top) &&
      top.length === 1 &&
      String(top[0]) !== buffer
    ) {
      commitCandidate(top[0]);
      return;
    }

    const pageSize = 10;
    const pageCount = Math.max(1, Math.ceil((top.length || 1) / pageSize));
    keyboardState.candidatePage = Math.min(keyboardState.candidatePage, pageCount - 1);

    const composeLabel = document.createElement('div');
    composeLabel.className = 'ime-compose';
    composeLabel.textContent = keyboardState.composing || '(无拼音)';
    wrap.appendChild(composeLabel);

    const list = document.createElement('div');
    list.className = 'ime-list';
    wrap.appendChild(list);

    if (keyboardState.dictLoading && !top.length) {
      const loading = document.createElement('div');
      loading.className = 'ime-candidate';
      loading.textContent = '词库加载中...';
      list.appendChild(loading);
      return;
    }
    const start = keyboardState.candidatePage * pageSize;
    const slice = top.slice(start, start + pageSize);
    slice.forEach((cand, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ime-candidate';
      btn.textContent = `${start + idx + 1}.${cand}`;
      btn.addEventListener('click', () => commitCandidate(cand));
      list.appendChild(btn);
    });

    if (pageCount > 1) {
      const pager = document.createElement('div');
      pager.className = 'ime-pager';
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'ime-pager-btn';
      prev.textContent = '上一页';
      prev.disabled = keyboardState.candidatePage === 0;
      prev.addEventListener('click', () => changeCandidatePage(-1));
      const info = document.createElement('div');
      info.className = 'ime-pager-info';
      info.textContent = `${keyboardState.candidatePage + 1} / ${pageCount}`;
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'ime-pager-btn';
      next.textContent = '下一页';
      next.disabled = keyboardState.candidatePage >= pageCount - 1;
      next.addEventListener('click', () => changeCandidatePage(1));
      pager.appendChild(prev);
      pager.appendChild(info);
      pager.appendChild(next);
      wrap.appendChild(pager);
    }
  }

  function changeCandidatePage(delta) {
    const size = 10;
    const total = keyboardState.candidates?.length || 0;
    if (!total) return;
    const pageCount = Math.max(1, Math.ceil(total / size));
    keyboardState.candidatePage = Math.min(
      pageCount - 1,
      Math.max(0, keyboardState.candidatePage + delta)
    );
    renderImeCandidates();
  }

  function commitCandidate(text) {
    const target = getKeyboardTarget();
    if (!target) return;
    insertTextAtEnd(target, text);
    keyboardState.composing = '';
    keyboardState.candidates = [];
    keyboardState.candidatePage = 0;
    renderImeCandidates();
  }

  function handleZhKey(label) {
    const target = getKeyboardTarget();
    if (!target) return;
    const ch = String(label || '').trim();
    if (!ch) return;
    if (/^\d+$/.test(ch)) {
      // Numbers should be inserted directly without IME composing.
      if (keyboardState.composing) {
        keyboardState.composing = '';
        keyboardState.candidates = [];
        keyboardState.candidatePage = 0;
        renderImeCandidates();
      }
      insertTextAtCursor(target, ch);
      return;
    }
    loadPinyinIndex();
    keyboardState.composing += ch.toLowerCase();
    keyboardState.candidatePage = 0;
    renderImeCandidates();
  }

  function handleEnKey(label) {
    insertTextAtCursor(getKeyboardTarget(), label);
  }

  function handleKeyboardKey(label) {
    const key = String(label || '').toLowerCase();
    if (key === 'space' || key === '空格') {
      handleKeyboardAction('space');
      return;
    }
    if (key === 'backspace' || key === '退格' || key === '←') {
      handleKeyboardAction('backspace');
      return;
    }
    if (key === 'clear') {
      handleKeyboardAction('clear');
      return;
    }
    if (keyboardState.lang === 'zh') {
      handleZhKey(label);
    } else {
      handleEnKey(label);
    }
  }

  function setLoginError(msg) {
    const node = document.getElementById('loginError');
    if (!node) return;
    if (!msg) {
      node.hidden = true;
      return;
    }
    node.textContent = msg;
    node.hidden = false;
  }

  async function attemptLogin() {
    const userRaw = document.getElementById('loginUser')?.value ?? '';
    const pass = document.getElementById('loginPass')?.value ?? '';
    const user = userRaw.trim();
    try {
      const res = api?.login
        ? await api.login(user, pass)
        : { ok: user === LOGIN_CREDENTIALS.username && pass === LOGIN_CREDENTIALS.password, role: 'admin', username: user };
      if (res && res.ok) {
        setLoginError(null);
        completeLogin({ username: res.username || user, role: res.role || 'user' });
        return true;
      }
    } catch (err) {
      console.warn('[PPHC] login failed', err);
    }
    setLoginError(t('loginFailed'));
    return false;
  }

  function setKeyboardTarget(input) {
    keyboardState.target = input || null;
    const zone = input?.dataset?.oskZone || 'default';
    keyboardState.zone = KEYBOARD_HOSTS[zone] ? zone : 'default';
    if (input) {
      focusEnd(input);
      showKeyboard();
      renderImeCandidates();
    }
  }

  function completeLogin(info = {}) {
    if (state.loggedIn) return;
    state.loggedIn = true;
    state.user = {
      username: String(info.username || ''),
      role: String(info.role || 'user') || 'user',
    };
    document.body.classList.remove('login-locked');
    document.body.classList.remove('view-login');
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.classList.add('hidden');
    }
    keyboardState.target = null;
    showView(state.user.role === 'engineer' ? 'engineer' : 'home');
    scheduleAutoConnect(0);
    ensureTelemetryLoop();
    startHeroClock();
    updateTelemetry();
  }

  function initLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) {
      state.loggedIn = true;
      document.body.classList.remove('login-locked');
      document.body.classList.remove('view-login');
      return;
    }
    document.body.classList.add('login-locked');
    document.body.classList.add('view-login');
    overlay.classList.add('active');
    const userInput = document.getElementById('loginUser');
    const passInput = document.getElementById('loginPass');
    [userInput, passInput].forEach((input) => {
      if (!input) return;
      if (input.id === 'loginUser') input.value = LOGIN_CREDENTIALS.username;
      else if (input.id === 'loginPass') input.value = LOGIN_CREDENTIALS.password;
      input.addEventListener('focus', () => {
        setKeyboardTarget(input);
      });
      input.addEventListener('click', () => {
        setKeyboardTarget(input);
      });
    });
    keyboardState.target = null;
    bindKeyboardControls();
    setKeyboardLang('zh');
    // preload dict in idle time to reduce首次输入抖动
    setTimeout(() => loadPinyinIndex(), 0);
    setLoginError(null);

    overlay.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'loginOverlay') {
        hideKeyboard();
      }
    });
    document.getElementById('loginSubmit')?.addEventListener('click', attemptLogin);
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      attemptLogin();
    });
  }

  function showLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;
    state.loggedIn = false;
    state.user = { username: '', role: 'user' };
    document.body.classList.add('login-locked');
    document.body.classList.add('view-login');
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    const userInput = document.getElementById('loginUser');
    const passInput = document.getElementById('loginPass');
    if (userInput) userInput.value = LOGIN_CREDENTIALS.username;
    if (passInput) passInput.value = '';
    setLoginError(null);
    hideKeyboard();
    showView('home');
  }

  function hideLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
    document.body.classList.remove('login-locked');
    document.body.classList.remove('view-login');
  }

  function bindOskInputs() {
    const inputs = document.querySelectorAll('input[data-osk-target], textarea[data-osk-target], .osk-input');
    inputs.forEach((input) => {
      if (input.classList.contains('date-input')) return;
      input.addEventListener('focus', () => setKeyboardTarget(input));
      input.addEventListener('click', () => setKeyboardTarget(input));
    });
  }

  function isShieldHealthy(side) {
    const presentRaw = state.shields[side];
    const presentNum = typeof presentRaw === 'string' ? Number(presentRaw) : Number(presentRaw);
    return presentRaw === true || presentNum === 1; // 高电平 = 在线
  }

  function setConnected(on) {
    state.connected = on;
    const connectionNode = $('#connectionState');
    if (connectionNode) connectionNode.textContent = on ? t('connected') : t('disconnected');
    const toggleBtn = $('#btnStartStop');
    if (toggleBtn) toggleBtn.disabled = !on;
    if (on) {
      if (state.autoConnectTimer) {
        clearTimeout(state.autoConnectTimer);
        state.autoConnectTimer = null;
      }
      startHeartbeat();
    } else {
      stopHeartbeat();
      state.running = false;
      state.lastHeartbeatAck = 0;
      setModeStage('--');
      updateRunState();
      scheduleAutoConnect(2000);
    }
  }

  function startHeartbeat() {
    stopHeartbeat();
    state.heartbeatTimer = setInterval(() => {
      if (!state.connected) return;
      state.heartbeatSeed = (state.heartbeatSeed + 1) & 0xff;
      api.sendU8(0x1000, state.heartbeatSeed);
    }, 1000);
  }

  function stopHeartbeat() {
    if (state.heartbeatTimer) {
      clearInterval(state.heartbeatTimer);
      state.heartbeatTimer = null;
    }
  }

  function scheduleAutoConnect(delay = 0) {
    if (state.autoConnectTimer) {
      clearTimeout(state.autoConnectTimer);
      state.autoConnectTimer = null;
    }
    state.autoConnectTimer = setTimeout(() => {
      state.autoConnectTimer = null;
      attemptAutoConnect();
    }, Math.max(0, delay));
  }

  async function attemptAutoConnect() {
    if (WEB_DEBUG) return;
    if (state.connected || state.connecting || !api?.connect) return;
    state.connecting = true;
    try {
      const ok = await api.connect(AUTO_PORT, AUTO_BAUD);
      if (ok) {
        setConnected(true);
        showAlert(`${t('connected')} ${AUTO_PORT} @ ${AUTO_BAUD}`);
      }
    } catch (err) {
      console.warn('auto connect failed', err);
    } finally {
      state.connecting = false;
      if (!state.connected) scheduleAutoConnect(3000);
    }
  }

  function updateHeartbeatUI() {
    const age = state.lastHeartbeatAck ? Date.now() - state.lastHeartbeatAck : null;
    const label = $('#heartbeatAge');
    if (label) label.textContent = age != null ? `${age} ms` : '-- ms';
    if (age != null && age > 3000 && state.connected) {
      showAlert(t('heartbeatTimeout'));
    }
  }

  function updateModeMeta() {
    const pressSlider = document.getElementById('pressMmHg');
    const pressChip = document.getElementById('pressMmHgValue');
    if (pressSlider && pressChip) pressChip.textContent = `${pressSlider.value} mmHg`;
    const durationSlider = document.getElementById('treatDuration');
    if (durationSlider) {
      const minutes = Math.max(1, Math.min(15, Number(durationSlider.value || 10)));
      const target = document.getElementById('durationValue');
      if (target) target.textContent = `${minutes} min`;
      if (!state.running) {
        const node = document.getElementById('countdown');
        if (node) node.textContent = `${String(minutes).padStart(2, '0')}:00`;
      }
    }
  }

  function applyLanguage(lang) {
    const next = lang === 'en' ? 'en' : 'zh';
    currentLang = next;
    state.settings.language = next;
    document.documentElement.lang = next === 'en' ? 'en' : 'zh';
    const set = (selector, key) => {
      const el = document.querySelector(selector);
      if (el && TRANSLATIONS?.[next]?.[key]) el.textContent = TRANSLATIONS[next][key];
    };

    set('title', 'appTitle');
    set('#btnExit', 'exit');
    set('#homeScreen h1', 'homeTitle');
    set('#homeScreen .hero-subtitle', 'homeSubtitle');
    const heroDesc = document.querySelector('#homeScreen .hero-desc');
    if (heroDesc) {
      if (!heroDesc.dataset.defaultDesc) heroDesc.dataset.defaultDesc = heroDesc.textContent || '';
      heroDesc.textContent = (TRANSLATIONS[next] && TRANSLATIONS[next].homeDesc) || heroDesc.dataset.defaultDesc || '';
    }
    set('#btnHomeDevice .label', 'btnDeviceLabel');
    set('#btnHomeDevice small', 'btnDeviceSub');
    set('#btnHomeQuick .label', 'btnQuickLabel');
    set('#btnHomeQuick small', 'btnQuickSub');
    set('#btnHomeNewPatient .label', 'btnNewPatientLabel');
    set('#btnHomeNewPatient small', 'btnNewPatientSub');
    set('#btnHomePatientList .label', 'btnPatientListLabel');
    set('#btnHomePatientList small', 'btnPatientListSub');
    set('#quickScreen .section-title', 'quickTitle');
    set('#settingsScreen .section-title', 'settingsTitle');
    set('#newPatientScreen .section-title', 'newPatientTitle');
    set('#patientListScreen .section-title', 'patientListTitle');
    set('#reportArchiveTitle', 'reportArchiveTitle');
    const openReportsBtn = document.getElementById('btnOpenReportArchive');
    if (openReportsBtn) openReportsBtn.textContent = t('reportArchiveOpen');
    const refreshReportsBtn = document.getElementById('btnRefreshReportArchive');
    if (refreshReportsBtn) refreshReportsBtn.textContent = t('reportArchiveRefresh');
    const printReportsBtn = document.getElementById('btnPrintArchiveReport');
    if (printReportsBtn) printReportsBtn.textContent = t('reportArchivePrint');
    const delPatientBtn = document.getElementById('btnDeletePatient');
    if (delPatientBtn) delPatientBtn.textContent = t('deleteOne');
    const clearPatientsBtn = document.getElementById('btnClearPatients');
    if (clearPatientsBtn) clearPatientsBtn.textContent = t('clearAll');
    const delReportBtn = document.getElementById('btnDeleteReport');
    if (delReportBtn) delReportBtn.textContent = t('deleteOne');
    const clearReportsBtn = document.getElementById('btnClearReports');
    if (clearReportsBtn) clearReportsBtn.textContent = t('clearAll');
    set('#engineerTitle', 'engineerTitle');
    set('#engineerParamsTitle', 'engineerParamsTitle');
    set('#engineerTestTitle', 'engineerTestTitle');
    set('#engineerPressureLabel', 'engineerPressureLabel');
    set('#engineerDurationLabel', 'engineerDurationLabel');
    set('#engineerTempLabel', 'engineerTempLabel');
    set('#engineerBrightnessLabel', 'engineerBrightnessLabel');
    set('#engineerVolumeLabel', 'engineerVolumeLabel');
    const engApply = document.getElementById('btnEngineerApplyToDevice');
    if (engApply) engApply.textContent = t('engineerApplyToDevice');
    const engSound = document.getElementById('btnEngineerTestSound');
    if (engSound) engSound.textContent = t('engineerTestSound');
    const emptyTip = document.getElementById('patientListEmpty');
    if (emptyTip && TRANSLATIONS[next]?.patientListEmpty) {
      emptyTip.textContent = TRANSLATIONS[next].patientListEmpty;
    }
    const labelMap = {
      '#lblPatientId': 'patientId',
      '#lblPatientName': 'patientName',
      '#lblPatientGender': 'patientGender',
      '#lblPatientPhone': 'patientPhone',
      '#lblPatientBirth': 'patientBirth',
      '#lblPatientNotes': 'patientNotes',
    };
    Object.entries(labelMap).forEach(([selector, key]) => {
      const el = document.querySelector(selector);
      if (el && TRANSLATIONS[next]?.[key]) el.textContent = TRANSLATIONS[next][key];
    });
    const dpModal = document.getElementById('datePickerModal');
    if (dpModal && !dpModal.hidden) renderDatePicker();
    if (state.currentView === 'patientList') renderPatientList();
    if (state.currentView === 'report') renderReport();
    if (state.currentView === 'reportArchive') loadReportArchive();
    if (state.currentView === 'engineer') renderEngineer();
    renderQuickPatientPicker();
    set('.summary-panel .panel-overline', 'summaryOverline');
    set('.summary-panel .panel-title', 'summaryTitle');
    set('#quickPatientTitle', 'quickPatientTitle');
    set('.curve-panel .panel-overline', 'curveOverline');
    set('.curve-panel .panel-title', 'curveTitle');

    const legendMap = {
      '.legend.pressure-left': 'legendPressureLeft',
      '.legend.pressure-right': 'legendPressureRight',
      '.legend.temp-left': 'legendTempLeft',
      '.legend.temp-right': 'legendTempRight',
    };
    Object.entries(legendMap).forEach(([sel, key]) => set(sel, key));

    const pressureHeads = $$('.curve-card.pressure .curve-head > div:first-child');
    if (pressureHeads[0]) pressureHeads[0].textContent = t('legendPressureLeft');
    if (pressureHeads[1]) pressureHeads[1].textContent = t('legendPressureRight');
    const tempHeads = $$('.curve-card.temp .curve-head > div:first-child');
    if (tempHeads[0]) tempHeads[0].textContent = t('legendTempLeft');
    if (tempHeads[1]) tempHeads[1].textContent = t('legendTempRight');

    const circleLabels = $$('.circle-label');
    if (circleLabels[0]) circleLabels[0].textContent = t('leftEye');
    if (circleLabels[1]) circleLabels[1].textContent = t('rightEye');
    const tempSpans = $$('.circle-temp span:first-child');
    tempSpans.forEach((el) => { el.textContent = t('temperature'); });

    set('.shield-panel .panel-title', 'shieldPanelTitle');
    const eyeLabels = $$('.shield-tile .eye-label');
    if (eyeLabels[0]) eyeLabels[0].textContent = t('leftEye');
    if (eyeLabels[1]) eyeLabels[1].textContent = t('rightEye');
    const metaLabels = $$('.shield-tile .meta-row span:first-child');
    metaLabels.forEach((el, idx) => {
      el.textContent = idx % 2 === 0 ? t('shieldPresentLabel') : t('shieldFuseLabel');
    });

    set('.treatment-panel .panel-overline', 'controlOverline');
    set('.treatment-panel .panel-title', 'controlTitle');
    set('.slider-card[data-kind=\"pressure\"] .eyebrow', 'pressureEyebrow');
    set('.slider-card[data-kind=\"pressure\"] strong', 'pressureStrong');
    set('.slider-card[data-kind=\"duration\"] .eyebrow', 'durationEyebrow');
    set('.slider-card[data-kind=\"duration\"] strong', 'durationStrong');

    const infoLabels = $$('.info-panel .label');
    if (infoLabels[0]) infoLabels[0].textContent = t('runStateLabel');
    if (infoLabels[1]) infoLabels[1].textContent = t('alarmLabel');
    if (infoLabels[2]) infoLabels[2].textContent = t('systemStateLabel');
    if (infoLabels[3]) infoLabels[3].textContent = t('connectionStateLabel');
    const connectionNode = $('#connectionState');
    if (connectionNode) connectionNode.textContent = state.connected ? t('connected') : t('disconnected');

    const navBtns = $$('.settings-nav button');
    const navMap = {
      display: ['navDisplay', 'navDisplayHint'],
      sound: ['navSound', 'navSoundHint'],
      printer: ['navPrinter', 'navPrinterHint'],
      accounts: ['navAccounts', 'navAccountsHint'],
      language: ['navLanguage', 'navLanguageHint'],
      about: ['navAbout', 'navAboutHint'],
      logs: ['navLogs', 'navLogsHint'],
    };
    navBtns.forEach((btn) => {
      const mod = btn.dataset.module;
      const pair = navMap[mod] || [];
      const labelKey = pair[0];
      const hintKey = pair[1];
      if (!labelKey) return;
      const hint = hintKey ? t(hintKey) : '';
      btn.innerHTML = `${t(labelKey)} ${hint ? `<span class=\"hint\">${hint}</span>` : ''}`;
    });

    const displayCard = document.querySelector('.settings-card.headered');
    if (displayCard) {
      const h3 = displayCard.querySelector('h3');
      if (h3) h3.textContent = t('displayCardTitle');
      const p = displayCard.querySelector('p');
      if (p) p.textContent = t('displayCardDesc');
      const metaRows = displayCard.querySelectorAll('.setting-row .meta strong');
      if (metaRows[0]) metaRows[0].textContent = t('brightnessLabel');
      if (metaRows[1]) metaRows[1].textContent = t('screensaverLabel');
      const metaHints = displayCard.querySelectorAll('.setting-row .meta span');
      if (metaHints[0]) metaHints[0].textContent = t('brightnessHint');
      if (metaHints[1]) metaHints[1].textContent = t('screensaverHint');
    }

    const soundCard = document.querySelector('#settingsModuleSound .settings-card');
    if (soundCard) {
      const h3 = soundCard.querySelector('h3');
      if (h3) h3.textContent = t('soundTitle');
      const meta = soundCard.querySelectorAll('.setting-row .meta strong');
      if (meta[0]) meta[0].textContent = t('volumeLabel');
      const hints = soundCard.querySelectorAll('.setting-row .meta span');
      if (hints[0]) hints[0].textContent = t('volumeHint');
      if (meta[1]) meta[1].textContent = t('chimeLabel');
      if (hints[1]) hints[1].textContent = t('chimeHint');
    }
    const printerCard = document.querySelector('#settingsModulePrinter .settings-card');
    if (printerCard) {
      const h3 = printerCard.querySelector('h3');
      if (h3) h3.textContent = t('printerTitle');
      const meta = printerCard.querySelectorAll('.setting-row .meta strong');
      if (meta[0]) meta[0].textContent = t('printerSelectLabel');
      const hints = printerCard.querySelectorAll('.setting-row .meta span');
      if (hints[0]) hints[0].textContent = t('printerSelectHint');
      const pillSpans = printerCard.querySelectorAll('.setting-row .pill span');
      if (pillSpans[0]) pillSpans[0].textContent = t('printerCurrentLabel');
      const refreshBtn = document.getElementById('btnRefreshPrinters');
      if (refreshBtn) refreshBtn.textContent = t('printersRefresh');
    }
    const accountsCard = document.querySelector('#settingsModuleAccounts .settings-card');
    if (accountsCard) {
      const h3 = accountsCard.querySelector('h3');
      if (h3) h3.textContent = t('accountsTitle');
      const addTitle = document.getElementById('accountsAddTitle');
      if (addTitle) addTitle.textContent = t('accountsAddTitle');
      const addHint = document.getElementById('accountsAddHint');
      if (addHint) addHint.textContent = t('accountsAddHint');
      const uLabel = document.getElementById('accountsUsernameLabel');
      if (uLabel) uLabel.textContent = t('accountsUsernameLabel');
      const pLabel = document.getElementById('accountsPasswordLabel');
      if (pLabel) pLabel.textContent = t('accountsPasswordLabel');
      const p2Label = document.getElementById('accountsPassword2Label');
      if (p2Label) p2Label.textContent = t('accountsPassword2Label');
      const addBtn = document.getElementById('btnAddAccount');
      if (addBtn) addBtn.textContent = t('accountsAddBtn');
      const logoutBtn = document.getElementById('btnLogout');
      if (logoutBtn) logoutBtn.textContent = t('accountsLogoutBtn');
    }
    const languageCard = document.querySelector('#settingsModuleLanguage .settings-card');
    if (languageCard) {
      const h3 = languageCard.querySelector('h3');
      if (h3) h3.textContent = t('languageTitle');
      const p = languageCard.querySelector('p');
      if (p) p.textContent = t('languageDesc');
      const meta = languageCard.querySelectorAll('.setting-row .meta strong');
      if (meta[0]) meta[0].textContent = t('languageLabel');
      const hints = languageCard.querySelectorAll('.setting-row .meta span');
      if (hints[0]) hints[0].textContent = t('languageHint');
      const labels = languageCard.querySelectorAll('.radio-pill span');
      if (labels[0]) labels[0].textContent = t('langZh');
      if (labels[1]) labels[1].textContent = t('langEn');
    }
    const aboutCard = document.querySelector('#settingsModuleAbout .settings-card');
    if (aboutCard) {
      const h3 = aboutCard.querySelector('h3');
      if (h3) h3.textContent = t('aboutTitle');
      const metaLabels = aboutCard.querySelectorAll('.settings-meta .label');
      if (metaLabels[0]) metaLabels[0].textContent = t('aboutVersion');
      if (metaLabels[1]) metaLabels[1].textContent = t('aboutFirmware');
      const buttons = aboutCard.querySelectorAll('.settings-actions button');
      if (buttons[0]) buttons[0].textContent = t('aboutCheck');
      if (buttons[1]) buttons[1].textContent = t('aboutLogs');
    }
    const logsCard = document.querySelector('#settingsModuleLogs .settings-card');
    if (logsCard) {
      const h3 = logsCard.querySelector('h3');
      if (h3) h3.textContent = t('logsTitle');
      const refreshBtn = document.getElementById('btnRefreshLogs');
      if (refreshBtn) refreshBtn.textContent = t('logsRefresh');
    }

    set('#shieldModal .modal-title', 'shieldModalTitle');
    set('#shieldModalText', 'shieldModalText');
    set('#shieldLostModal .modal-title', 'shieldLostTitle');
    const lostText = document.querySelector('#shieldLostModal p');
    if (lostText) lostText.textContent = t('shieldLostText');
    set('#shieldLostBack', 'shieldLostBack');

    set('#confirmCancel', 'confirmCancel');
    set('#confirmContinue', 'confirmContinue');

    set('#exportAfterTreatmentTitle', 'exportAfterTreatmentTitle');
    set('#exportAfterTreatmentText', 'exportAfterTreatmentText');
    set('#btnExportAfterNo', 'exportAfterTreatmentNo');
    set('#btnExportAfterYes', 'exportAfterTreatmentYes');

    updateRunState();
    setModeStage(state.modeStage);
    renderShieldIndicators();
  }

  function updateSettingsUI() {
    const brightness = document.getElementById('settingsBrightness');
    const brightnessValue = document.getElementById('settingsBrightnessValue');
    const brightnessPct = clampBrightness(state.settings.brightness);
    if (brightness) brightness.value = brightnessPct;
    if (brightnessValue) brightnessValue.textContent = `${brightnessPct}%`;

    const screensaver = document.getElementById('screensaverSelect');
    if (screensaver) screensaver.value = String(state.settings.screensaver);
    const saverChip = document.getElementById('screensaverValue');
    if (saverChip) saverChip.textContent = `${state.settings.screensaver} min`;
    updateCustomSelectDisplay(screensaver);

    const volume = document.getElementById('settingsVolume');
    const volumeValue = document.getElementById('settingsVolumeValue');
    const volPct = clampVolume(state.settings.volume);
    if (volume) volume.value = volPct;
    if (volumeValue) volumeValue.textContent = `${volPct}%`;

    const langZh = document.getElementById('languageZh');
    const langEn = document.getElementById('languageEn');
    if (langZh) langZh.checked = state.settings.language === 'zh';
    if (langEn) langEn.checked = state.settings.language === 'en';
    const langChip = document.getElementById('languageValue');
    if (langChip) langChip.textContent = state.settings.language === 'zh' ? TRANSLATIONS.zh.langZh : TRANSLATIONS.en.langEn;

    const chimeToggle = document.getElementById('chimeToggle');
    if (chimeToggle) chimeToggle.checked = !!state.settings.playChime;

    const printerNameNode = document.getElementById('printerCurrentName');
    if (printerNameNode) {
      printerNameNode.textContent = state.settings.printerName || t('printerNotSet');
    }
    const printerSelect = document.getElementById('printerSelect');
    if (printerSelect) {
      if (state.settings.printerName) {
        printerSelect.value = state.settings.printerName;
      }
      updateCustomSelectDisplay(printerSelect);
    }

    const appVersion = document.getElementById('settingsAppVersion');
    if (appVersion) appVersion.textContent = state.settings.appVersion;
    const firmware = document.getElementById('settingsFirmwareVersion');
    if (firmware) firmware.textContent = state.settings.firmwareVersion;
  }

  let logsCache = [];
  let activeLogName = null;

  function setSettingsModule(moduleKey) {
    const next = moduleKey || state.settingsActiveModule || 'display';
    state.settingsActiveModule = next;
    $$('.settings-module').forEach((mod) => {
      mod.classList.toggle('active', mod.dataset.module === next);
    });
    $$('.settings-nav button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.module === next);
    });
    if (next === 'logs') {
      loadLogsList();
    } else if (next === 'printer') {
      loadPrintersList();
    } else if (next === 'accounts') {
      loadAccounts();
    }
  }

  async function loadLogsList(preselect) {
    const listNode = document.getElementById('logsList');
    const viewerNode = document.getElementById('logContent');
    if (!listNode) return;
    listNode.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'empty-tip';
    loading.textContent = t('logsLoading');
    listNode.appendChild(loading);
    if (viewerNode) viewerNode.textContent = '';
    try {
      const logs = api?.listLogs ? await api.listLogs() : [];
      logsCache = Array.isArray(logs) ? logs : [];
      activeLogName = preselect || logsCache[0]?.name || null;
      renderLogsList();
      if (activeLogName) await selectLog(activeLogName, { silent: true });
    } catch (err) {
      console.warn('[PPHC] load logs failed', err);
      listNode.innerHTML = `<div class="empty-tip">${t('logsReadFailed')}</div>`;
    }
  }

  function renderLogsList() {
    const listNode = document.getElementById('logsList');
    if (!listNode) return;
    listNode.innerHTML = '';
    if (!logsCache.length) {
      listNode.innerHTML = `<div class="empty-tip">${t('logsEmpty')}</div>`;
      return;
    }
    logsCache.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'log-item';
      if (item.name === activeLogName) btn.classList.add('active');
      const title = document.createElement('span');
      title.textContent = item.name;
      const meta = document.createElement('small');
      if (item.mtimeMs) {
        meta.textContent = new Date(item.mtimeMs).toLocaleString();
      }
      btn.append(title, meta);
      btn.addEventListener('click', () => selectLog(item.name));
      listNode.appendChild(btn);
    });
  }

  async function selectLog(name, opts = {}) {
    activeLogName = name;
    renderLogsList();
    const viewerNode = document.getElementById('logContent');
    if (viewerNode) viewerNode.textContent = t('logsLoading');
    try {
      const content = api?.readLog ? await api.readLog(name) : '';
      if (viewerNode) viewerNode.textContent = content || '';
    } catch (err) {
      console.warn('[PPHC] read log failed', err);
      if (viewerNode) viewerNode.textContent = t('logsReadFailed');
      if (!opts.silent) showAlert(t('logsReadFailed'));
    }
  }

  let printersCache = [];

  async function loadPrintersList(preselect) {
    const select = document.getElementById('printerSelect');
    if (!select) return;
    const currentName = preselect || state.settings.printerName || '';
    if (select._custom?.wrapper) {
      select._custom.wrapper.remove();
      delete select._custom;
      select.classList.remove('native-select-hidden');
    }
    select.innerHTML = '';
    try {
      const list = api?.listPrinters ? await api.listPrinters() : [];
      printersCache = Array.isArray(list) ? list : [];
      if (!printersCache.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = t('printerEmpty');
        select.appendChild(opt);
        select.value = '';
      } else {
        printersCache.forEach((p) => {
          const opt = document.createElement('option');
          opt.value = p.name;
          const label = p.displayName || p.name;
          opt.textContent = p.isDefault ? `${label} (${t('default')})` : label;
          select.appendChild(opt);
        });
        const defaultPrinter = printersCache.find((p) => p.isDefault)?.name;
        select.value = currentName || defaultPrinter || printersCache[0].name;
      }
      state.settings.printerName = select.value || '';
      attachCustomSelect('printerSelect');
      updateSettingsUI();
    } catch (err) {
      console.warn('[PPHC] list printers failed', err);
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = t('printerEmpty');
      select.appendChild(opt);
      select.value = '';
      attachCustomSelect('printerSelect');
      updateSettingsUI();
    }
  }

  async function syncPrinterSelection() {
    if (!api?.getPrinter) return;
    try {
      const res = await api.getPrinter();
      if (res && typeof res.printerName === 'string') {
        state.settings.printerName = res.printerName;
        updateSettingsUI();
      }
    } catch (err) {
      console.warn('[PPHC] get printer failed', err);
    }
  }

  let accountsCache = [];

  function setAccountsMessage(msg, isError = false) {
    const node = document.getElementById('accountsMessage');
    if (!node) return;
    if (!msg) {
      node.hidden = true;
      node.textContent = '';
      node.classList.remove('error');
      return;
    }
    node.hidden = false;
    node.textContent = msg;
    node.classList.toggle('error', !!isError);
  }

  function renderAccountsList() {
    const listNode = document.getElementById('accountsList');
    if (!listNode) return;
    listNode.innerHTML = '';
    if (!accountsCache.length) {
      listNode.innerHTML = `<div class="empty-tip">${t('accountsEmpty')}</div>`;
      return;
    }
    accountsCache.forEach((acc) => {
      const row = document.createElement('div');
      row.className = 'account-item';
      const meta = document.createElement('div');
      meta.className = 'meta';
      const title = document.createElement('strong');
      title.textContent = acc.username || '--';
      const sub = document.createElement('small');
      sub.textContent = acc.role ? String(acc.role) : '';
      meta.append(title, sub);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'account-remove';
      removeBtn.textContent = t('accountsRemoveBtn');
      removeBtn.disabled = String(acc.username || '').toLowerCase() === 'admin';
      removeBtn.addEventListener('click', async () => {
        if (removeBtn.disabled) return;
        try {
          await api?.removeAccount?.(acc.username);
          await loadAccounts();
        } catch (err) {
          console.warn('[PPHC] remove account failed', err);
          setAccountsMessage(t('accountsRemoveFailed'), true);
        }
      });
      row.append(meta, removeBtn);
      listNode.appendChild(row);
    });
  }

  async function loadAccounts() {
    setAccountsMessage(null);
    try {
      const list = api?.listAccounts ? await api.listAccounts() : [];
      accountsCache = Array.isArray(list) ? list : [];
      renderAccountsList();
    } catch (err) {
      console.warn('[PPHC] list accounts failed', err);
      accountsCache = [];
      renderAccountsList();
      setAccountsMessage(t('accountsAddFailed'), true);
    }
  }

  async function handleAddAccount() {
    setAccountsMessage(null);
    const u = document.getElementById('accountUsername');
    const p = document.getElementById('accountPassword');
    const p2 = document.getElementById('accountPassword2');
    const username = u?.value?.trim() || '';
    const password = p?.value || '';
    const password2 = p2?.value || '';
    if (!username || !password) {
      setAccountsMessage(t('accountsAddFailed'), true);
      return;
    }
    if (password !== password2) {
      setAccountsMessage(t('accountsPasswordMismatch'), true);
      return;
    }
    try {
      await api?.addAccount?.({ username, password, role: 'user' });
      if (u) u.value = '';
      if (p) p.value = '';
      if (p2) p2.value = '';
      setAccountsMessage(t('accountsAddSuccess'), false);
      await loadAccounts();
    } catch (err) {
      console.warn('[PPHC] add account failed', err);
      setAccountsMessage(t('accountsAddFailed'), true);
    }
  }

  async function handleCheckUpdates() {
    showAlert(t('checkingUpdates'));
    try {
      const res = api?.checkUpdates ? await api.checkUpdates() : null;
      if (res && res.updateAvailable) {
        const v = res.latestVersion ? ` ${res.latestVersion}` : '';
        showAlert(`${t('updateAvailable')}${v}`, 4000);
      } else {
        showAlert(t('updateNotAvailable'), 3000);
      }
    } catch (err) {
      console.warn('[PPHC] check updates failed', err);
      showAlert(t('updateCheckFailed'), 3000);
    }
  }

  async function syncSystemBrightness() {
    if (!api?.getBrightness) return;
    try {
      const info = await api.getBrightness();
      if (info && typeof info.percent === 'number') {
        state.settings.brightness = clampBrightness(info.percent);
        updateSettingsUI();
      }
    } catch (err) {
      console.warn('[PPHC] getBrightness failed', err);
    }
  }

  async function syncSystemVolume() {
    if (!api?.getVolume) return;
    try {
      const info = await api.getVolume();
      if (info && typeof info.percent === 'number') {
        state.settings.volume = clampVolume(info.percent);
        updateSettingsUI();
      }
    } catch (err) {
      console.warn('[PPHC] getVolume failed', err);
    }
  }

  async function syncPlayChime() {
    if (!api?.getPlayChime) return;
    try {
      const info = await api.getPlayChime();
      if (info && typeof info.on === 'boolean') {
        state.settings.playChime = info.on;
        updateSettingsUI();
      }
    } catch (err) {
      console.warn('[PPHC] getPlayChime failed', err);
    }
  }

  function updateCustomSelectDisplay(selectEl) {
    if (!selectEl || !selectEl._custom) return;
    const { wrapper, labelNode, items } = selectEl._custom;
    if (labelNode) {
      const selected = selectEl.options[selectEl.selectedIndex];
      labelNode.textContent = selected ? selected.textContent : '';
    }
    if (Array.isArray(items)) {
      items.forEach((item) => {
        item.classList.toggle('active', item.dataset.value === selectEl.value);
      });
    }
    if (wrapper) wrapper.classList.remove('open');
  }

  function attachCustomSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select || select._custom) return;
    select.classList.add('native-select-hidden');
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    wrapper.dataset.for = selectId;

    const display = document.createElement('button');
    display.type = 'button';
    display.className = 'custom-select-display';
    display.innerHTML = `<span class="label"></span><span class="chevron">⌄</span>`;

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    const items = [];
    Array.from(select.options).forEach((opt) => {
      const item = document.createElement('div');
      item.className = 'custom-select-item';
      item.dataset.value = opt.value;
      item.innerHTML = `<span>${opt.textContent}</span>`;
      item.addEventListener('click', () => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        updateCustomSelectDisplay(select);
      });
      menu.appendChild(item);
      items.push(item);
    });

    wrapper.appendChild(display);
    wrapper.appendChild(menu);
    select.insertAdjacentElement('afterend', wrapper);

    const toggle = () => {
      wrapper.classList.toggle('open');
    };
    display.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });

    select._custom = { wrapper, labelNode: display.querySelector('.label'), items };
    updateCustomSelectDisplay(select);
  }

  async function applyBrightness(percent) {
    if (!api?.setBrightness) return;
    try {
      const result = await api.setBrightness(percent);
      if (result && typeof result.percent === 'number') {
        state.settings.brightness = clampBrightness(result.percent);
        updateSettingsUI();
      }
    } catch (err) {
      console.error('[PPHC] setBrightness failed', err);
      showAlert(t('brightnessApplyFailed'));
      syncSystemBrightness();
    }
  }

  function requestVolumeApply(percent) {
    if (!api?.setVolume) return;
    const target = clampVolume(percent);
    state.settings.volume = target;
    updateSettingsUI();
    if (volumeApplyTimer) clearTimeout(volumeApplyTimer);
    volumeApplyTimer = setTimeout(() => {
      volumeApplyTimer = null;
      applyVolume(target);
    }, 120);
  }

  async function applyVolume(percent) {
    if (!api?.setVolume) return;
    try {
      const result = await api.setVolume(percent);
      if (result && typeof result.percent === 'number') {
        state.settings.volume = clampVolume(result.percent);
        updateSettingsUI();
      }
    } catch (err) {
      console.warn('[PPHC] setVolume failed', err);
    }
  }

  function requestBrightnessApply(percent) {
    const target = clampBrightness(percent);
    state.settings.brightness = target;
    updateSettingsUI();
    if (brightnessApplyTimer) clearTimeout(brightnessApplyTimer);
    brightnessApplyTimer = setTimeout(() => {
      brightnessApplyTimer = null;
      applyBrightness(target);
    }, 120);
  }

  function formatMmHg(val) {
    if (val == null) return '--.-';
    return Number(val).toFixed(1);
  }

  function formatTemp(t) {
    if (t == null) return '--.-';
    return Number(t).toFixed(1);
  }

  function setModeStage(stage) {
    const raw = (stage ?? '').toString().trim();
    const letter = raw ? raw[0].toLowerCase() : '';
    state.modeStage = letter || '--';
    const chip = document.getElementById('modeStageChip');
    if (chip) {
      const labelText = STAGE_LABELS[letter] ? t(STAGE_LABELS[letter]) : t('stageIdle');
      const stageClass = STAGE_CLASS[letter] || 'stage-idle';
      chip.className = `live-chip stage-chip ${stageClass}`;
      if (!chip.querySelector('.stage-label')) {
        chip.innerHTML =
          `<span class="stage-eyebrow">${t('currentStage')}</span>` +
          `<div class="stage-main">` +
          `<span class="stage-orb"></span>` +
          `<span class="stage-label">${labelText}</span>` +
          `</div>`;
      } else {
        const labelNode = chip.querySelector('.stage-label');
        if (labelNode) labelNode.textContent = labelText;
        const eyebrow = chip.querySelector('.stage-eyebrow');
        if (eyebrow) eyebrow.textContent = t('currentStage');
      }
    }
  }

  function updateHeroClock() {
    const node = document.getElementById('heroClock');
    if (!node) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const text = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
    node.textContent = text;
  }

  function pushData(ch, value) {
    const buf = state.buf[ch] || (state.buf[ch] = []);
    buf.push(value);
    if (buf.length > state.max) buf.shift();
    state.latest[ch] = value;
    if ((ch === 1 || ch === 3) && typeof value === 'number') {
      if (value > 45 && !state.tempHighAlerted) {
        state.tempHighAlerted = true;
        playSound('tempHigh');
      } else if (value < 44) {
        state.tempHighAlerted = false;
      }
    }
  }

  function drawSparkline(canvas, data, color, cfg = {}) {
    const { visibleMax, yMin, yMax, target } = cfg || {};
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const targetRaw = typeof target === 'function' ? target() : target;
    const targetVal = Number.isFinite(targetRaw) ? Number(targetRaw) : null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const samples = Array.isArray(data) ? data.slice(-canvas.width) : [];
    if (!samples.length && targetVal == null) return;
    const vals = samples.slice();
    if (targetVal != null) vals.push(targetVal);
    let minVal = typeof yMin === 'number' ? yMin : vals.length ? Math.min(...vals) : 0;
    let maxVal = typeof yMax === 'number' ? yMax : vals.length ? Math.max(...vals) : 1;
    if (typeof visibleMax === 'number') {
      const span = Math.max(visibleMax, maxVal - minVal);
      const center = (maxVal + minVal) / 2;
      minVal = center - span / 2;
      maxVal = center + span / 2;
    }
    if (minVal === maxVal) {
      minVal -= 1;
      maxVal += 1;
    }
    const padding = (maxVal - minVal) * 0.1 || 1;
    minVal -= padding;
    maxVal += padding;
    const range = maxVal - minVal || 1;
    const yFor = (v) => canvas.height * (1 - (v - minVal) / range);
    if (samples.length) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      samples.forEach((val, idx) => {
        const x = (idx / (samples.length - 1 || 1)) * canvas.width;
        const y = yFor(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    if (targetVal != null) {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      const ty = yFor(targetVal);
      ctx.beginPath();
      ctx.moveTo(0, ty);
      ctx.lineTo(canvas.width, ty);
      ctx.stroke();
      ctx.restore();
    }
  }

  function updateTelemetry() {
    if (!state.loggedIn) return;
    const pl = $('#pressureLeft');
    const pr = $('#pressureRight');
    const pll = $('#pressureLeftLabel');
    const prl = $('#pressureRightLabel');
    const tl = $('#tempLeft');
    const tr = $('#tempRight');
    const tll = $('#tempLeftLabel');
    const trl = $('#tempRightLabel');
    if (pl) pl.textContent = formatMmHg(state.latest[0]);
    if (pr) pr.textContent = formatMmHg(state.latest[2]);
    if (pll) pll.textContent = `${formatMmHg(state.latest[0])} mmHg`;
    if (prl) prl.textContent = `${formatMmHg(state.latest[2])} mmHg`;
    if (tl) tl.textContent = `${formatTemp(state.latest[1])}℃`;
    if (tr) tr.textContent = `${formatTemp(state.latest[3])}℃`;
    if (tll) tll.textContent = `${formatTemp(state.latest[1])}℃`;
    if (trl) trl.textContent = `${formatTemp(state.latest[3])}℃`;
    sparkTargets.forEach((target) =>
      drawSparkline(target.canvas(), state.buf[target.key], target.color, target)
    );
    updateHeartbeatUI();
  }

  function ensureTelemetryLoop() {
    if (state.telemetryTimer) return;
    state.telemetryTimer = setInterval(updateTelemetry, 200);
  }

  function startHeroClock() {
    if (state.heroClockTimer) return;
    updateHeroClock();
    state.heroClockTimer = setInterval(updateHeroClock, 30000);
  }

  function updateRunState() {
    const runNode = $('#runState');
    if (runNode) runNode.textContent = state.running ? t('running') : t('standby');
    const toggleBtn = $('#btnStartStop');
    if (toggleBtn) {
      toggleBtn.textContent = state.running ? t('stop') : t('start');
      toggleBtn.classList.toggle('active', state.running);
    }
  }

  function showAlert(msg, duration = 2500, kind = 'info') {
    const banner = $('#alertBanner');
    if (!banner) return;
    banner.classList.remove('success', 'error', 'info');
    banner.classList.add(kind || 'info');
    banner.textContent = msg;
    banner.hidden = false;
    if (banner._timer) clearTimeout(banner._timer);
    banner._timer = setTimeout(() => {
      banner.hidden = true;
    }, duration);
  }

  function setupDragScroll(node) {
    if (!node || node._dragScrollSetup) return;
    node._dragScrollSetup = true;
    let activePointer = null;
    let startY = 0;
    let startScrollTop = 0;
    let dragging = false;
    let hasCapture = false;
    const DRAG_THRESHOLD_PX = 14;

    node.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      activePointer = e.pointerId;
      startY = e.clientY;
      startScrollTop = node.scrollTop;
      dragging = false;
      hasCapture = false;
      node._suppressClick = false;
    });

    node.addEventListener('pointermove', (e) => {
      if (activePointer == null || e.pointerId !== activePointer) return;
      const dy = e.clientY - startY;
      if (!dragging && Math.abs(dy) > DRAG_THRESHOLD_PX) {
        dragging = true;
        node._suppressClick = true;
        try {
          node.setPointerCapture(activePointer);
          hasCapture = true;
        } catch {}
        node.classList.add('dragging');
      }
      if (!dragging) return;
      node.scrollTop = startScrollTop - dy;
      node._suppressClick = true;
      e.preventDefault();
    });

    const end = (e) => {
      if (activePointer == null || e.pointerId !== activePointer) return;
      if (hasCapture) {
        try {
          node.releasePointerCapture(activePointer);
        } catch {}
      }
      activePointer = null;
      hasCapture = false;
      node.classList.remove('dragging');
      setTimeout(() => {
        node._suppressClick = false;
      }, 0);
    };

    node.addEventListener('pointerup', end);
    node.addEventListener('pointercancel', end);

    node.addEventListener(
      'click',
      (e) => {
        if (!node._suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );
  }

  function closeExportAfterTreatmentModal() {
    const modal = document.getElementById('exportAfterTreatmentModal');
    if (modal) modal.hidden = true;
  }

  function openExportAfterTreatmentModal() {
    const modal = document.getElementById('exportAfterTreatmentModal');
    if (!modal) return;
    const title = document.getElementById('exportAfterTreatmentTitle');
    if (title) title.textContent = t('exportAfterTreatmentTitle');
    const text = document.getElementById('exportAfterTreatmentText');
    if (text) {
      const base = t('exportAfterTreatmentText');
      const patient = getPatientById(state.treatmentPatientId) || state.activePatient;
      if (patient && (patient.id || patient.name)) {
        const line =
          currentLang === 'en'
            ? `Patient: ${[patient.id, patient.name].filter(Boolean).join(' · ')}`
            : `患者：${[patient.id, patient.name].filter(Boolean).join(' · ')}`;
        text.textContent = `${base} ${line}`;
      } else {
        text.textContent = base;
      }
    }
    modal.hidden = false;
  }

  async function confirmExportAfterTreatment() {
    closeExportAfterTreatmentModal();
    state.activePatient = getPatientById(state.treatmentPatientId) || state.activePatient || null;
    renderReport();
    await handleExportReportPdf();
  }

  function updateCountdown() {
    const node = document.getElementById('countdown');
    if (!node || !state.running) return;
    const remain = Math.max(0, state.countdownEnd - Date.now());
    const sec = Math.ceil(remain / 1000);
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    node.textContent = `${m}:${s}`;
    if (remain <= 0) {
      // 自动停止
      api.sendU8(0x10c2, 1);
      state.running = false;
      state.activeSides = [];
      state.shieldDropShown = false;
      if (state.countdownTimer) {
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
      }
      updateRunState();
      setModeStage('--');
      playSound('stop');
      openExportAfterTreatmentModal();
    }
  }

  function clearTelemetryBuffers() {
    Object.keys(state.buf).forEach((k) => (state.buf[k] = []));
    state.latest = { 0: null, 1: null, 2: null, 3: null };
    updateTelemetry();
  }

  function renderShieldIndicators() {
    const map = {
      left: {
        wrap: document.getElementById('shieldLeft'),
        state: document.getElementById('shieldLeftState'),
        present: document.getElementById('shieldLeftPresent'),
        fuse: document.getElementById('shieldLeftFuse'),
      },
      right: {
        wrap: document.getElementById('shieldRight'),
        state: document.getElementById('shieldRightState'),
        present: document.getElementById('shieldRightPresent'),
        fuse: document.getElementById('shieldRightFuse'),
      },
    };
    Object.entries(map).forEach(([side, refs]) => {
      if (!refs.wrap) return;
      const presentVal = state.shieldDetail[`${side}Present`];
      const online = !!state.shields[side];
      const fuseVal = state.shieldDetail[`${side}Fuse`];
      const fuseNum = typeof fuseVal === 'string' ? Number(fuseVal) : Number(fuseVal);
      const healthy = online; // 熔断不影响在线判断
      refs.wrap.classList.toggle('active', healthy);
      if (refs.state) refs.state.textContent = online ? t('shieldOnline') : t('shieldOffline');
      if (refs.present)
        refs.present.textContent =
          presentVal == null ? '--' : presentVal ? t('shieldPresentYes') : t('shieldPresentNo');
      if (refs.fuse)
        refs.fuse.textContent =
          fuseVal == null ? '--' : fuseNum === 0 ? t('fuseBlown') : t('fuseOk');
    });
  }

  function openShieldAlert(text) {
    state.pendingSides = null;
    const modal = document.getElementById('shieldModal');
    const label = document.getElementById('shieldModalText');
    if (label) label.textContent = text;
    if (modal) modal.hidden = false;
  }

  function openShieldConfirm(sides) {
    state.pendingSides = sides;

    const modal = document.getElementById('shieldConfirm');
    const title = document.getElementById('shieldConfirmTitle');
    const text = document.getElementById('shieldConfirmText');

    if (title && text) {
      // Show the side that is offline/abnormal, not the one still available to treat
      const missingLeft = !sides.includes('left');
      title.textContent = missingLeft ? t('shieldConfirmTitleLeft') : t('shieldConfirmTitleRight');
      text.textContent = missingLeft ? t('shieldConfirmTextLeft') : t('shieldConfirmTextRight');
    }

    if (modal) modal.hidden = false;
  }

  function startTreatmentForSides(sides) {
    const enableLeft = sides.includes('left');
    const enableRight = sides.includes('right');
    clearTelemetryBuffers();
    setModeStage('--');
    state.pendingSides = null;
    state.activeSides = sides.slice();
    state.shieldDropShown = false;
    api.sendU8(0x1004, enableLeft ? 1 : 0);
    api.sendU8(0x1005, enableRight ? 1 : 0);
    const tempC = Number.isFinite(Number(state.targets.temp)) ? Number(state.targets.temp) : TEMP_FIXED_C;
    api.sendF32(0x1002, tempC);
    const mmHg = Number(document.getElementById('pressMmHg')?.value ?? 0);
    state.targets.pressure = mmHg;
    api.sendF32(0x1001, mmHg); // 发送原始 mmHg
    api.sendU8(0x10c0, state.mode || 1);
    const sliderMin = Math.max(
      1,
      Math.min(15, Number(document.getElementById('treatDuration')?.value || 10))
    );
    const min =
      state.user?.role === 'engineer' && Number.isFinite(Number(state.targets.durationMin))
        ? Math.max(1, Math.min(30, Math.round(Number(state.targets.durationMin))))
        : sliderMin;
    state.lastTreatment = {
      startedAt: new Date().toISOString(),
      pressureMmHg: mmHg,
      durationMin: min,
      mode: state.mode || 1,
      sides: sides.slice(),
      tempC,
    };
    api.sendU16(0x1006, min);
    api.sendU8(0x10c1, 1);
    state.running = true;
    state.countdownEnd = Date.now() + min * 60 * 1000;
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    state.countdownTimer = setInterval(updateCountdown, 250);
    updateRunState();
    playSound('start');
  }

  function handleShieldDropOffline() {
    if (!state.running || state.shieldDropShown) return;
    state.shieldDropShown = true;
    api.sendU8(0x10c2, 1);
    state.running = false;
    state.activeSides = [];
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
    updateRunState();
    const modal = document.getElementById('shieldLostModal');
    if (modal) modal.hidden = false;
  }

  function clearShieldLostModal() {
    const modal = document.getElementById('shieldLostModal');
    if (modal && !modal.hidden) modal.hidden = true;
    state.shieldDropShown = false;
  }

  function handleStartClick() {
    if (!state.connected) return;
    const left = !!state.shields.left;
    const right = !!state.shields.right;
    if (left && right) {
      startTreatmentForSides(['left', 'right']);
      return;
    }
    if (!left && !right) {
      openShieldAlert('未检测到治疗眼罩，请正确佩戴后再开始治疗。');
      playSound('shield');
      return;
    }
    const active = left ? ['left'] : ['right'];
    playSound('shield');
    openShieldConfirm(active);
  }

  function bindSettingsControls() {
    const brightness = document.getElementById('settingsBrightness');
    if (brightness) {
      brightness.value = clampBrightness(state.settings.brightness);
      brightness.addEventListener('input', () => {
        requestBrightnessApply(brightness.value);
      });
    }

    const screensaver = document.getElementById('screensaverSelect');
    attachCustomSelect('screensaverSelect');
    if (screensaver) {
      screensaver.value = String(state.settings.screensaver);
      screensaver.addEventListener('change', () => {
        state.settings.screensaver = Number(screensaver.value || 5);
        updateSettingsUI();
      });
    }

    const volume = document.getElementById('settingsVolume');
    if (volume) {
      volume.value = clampVolume(state.settings.volume);
      volume.addEventListener('input', () => {
        state.settings.volume = clampVolume(volume.value);
        updateSettingsUI();
        requestVolumeApply(state.settings.volume);
      });
    }

    document.getElementById('languageZh')?.addEventListener('change', () => {
      state.settings.language = 'zh';
      applyLanguage('zh');
      updateSettingsUI();
    });
    document.getElementById('languageEn')?.addEventListener('change', () => {
      state.settings.language = 'en';
      applyLanguage('en');
      updateSettingsUI();
    });

    const chimeToggle = document.getElementById('chimeToggle');
    if (chimeToggle) {
      chimeToggle.checked = !!state.settings.playChime;
      chimeToggle.addEventListener('change', () => {
        state.settings.playChime = !!chimeToggle.checked;
        updateSettingsUI();
        api?.setPlayChime?.(state.settings.playChime);
      });
    }

    document.getElementById('btnCheckUpdates')?.addEventListener('click', () => {
      handleCheckUpdates();
    });
    document.getElementById('btnRefreshLogs')?.addEventListener('click', () => {
      loadLogsList(activeLogName);
    });
    document.getElementById('btnRefreshPrinters')?.addEventListener('click', () => {
      loadPrintersList(state.settings.printerName);
    });
    const printerSelect = document.getElementById('printerSelect');
    if (printerSelect) {
      printerSelect.addEventListener('change', async () => {
        const name = printerSelect.value || '';
        state.settings.printerName = name;
        updateSettingsUI();
        try {
          await api?.setPrinter?.(name);
          showAlert(t('printerSaved'));
        } catch (err) {
          console.warn('[PPHC] set printer failed', err);
          showAlert(t('printerSaveFailed'));
        }
      });
    }

    document.getElementById('btnAddAccount')?.addEventListener('click', handleAddAccount);
    document.getElementById('btnLogout')?.addEventListener('click', showLoginOverlay);

    $$('.settings-nav button').forEach((btn) => {
      btn.addEventListener('click', () => setSettingsModule(btn.dataset.module));
    });
  }

  function bindEvents() {
    console.info('[PPHC] binding UI events');
    [
      'btnHomeQuick',
      'btnHomeNewPatient',
      'btnHomePatientList',
      'btnBackHome',
      'btnExit',
      'btnHomeDevice',
      'btnStartStop',
      'pressMmHg',
      'treatDuration',
      'modalClose',
      'shieldModal',
      'shieldConfirm',
      'confirmCancel',
      'confirmContinue',
      'shieldLostBack',
      'btnBackSettings',
      'btnBackNewPatient',
      'btnBackPatientList',
      'btnBackReport',
      'btnBackReportArchive',
      'btnOpenReportArchive',
      'btnRefreshReportArchive',
      'btnBackEngineer',
      'btnExportPdf',
      'btnPrintReport',
      'btnGoPatientList',
      'patientForm',
    ].forEach((id) => {
      if (!document.getElementById(id)) console.warn('[PPHC] missing element', id);
    });
    document.getElementById('btnHomeQuick')?.addEventListener('click', () => {
      showView('quick');
      if (!isShieldHealthy('left') || !isShieldHealthy('right')) {
        playSound('shield');
      }
    });
    document.getElementById('btnHomeNewPatient')?.addEventListener('click', () => {
      ensurePatientsLoaded();
      resetPatientForm();
      showView('newPatient');
    });
    document.getElementById('btnHomePatientList')?.addEventListener('click', () => {
      ensurePatientsLoaded();
      showView('patientList');
    });
    document.getElementById('btnBackHome')?.addEventListener('click', () => showView('home'));
    document.getElementById('btnExit')?.addEventListener('click', () => {
      if (api && api.exitApp) api.exitApp();
      else window.close();
    });
    document.getElementById('btnHomeDevice')?.addEventListener('click', () => showView('settings'));
    document.getElementById('btnBackNewPatient')?.addEventListener('click', () =>
      showView('home')
    );
    document.getElementById('btnBackPatientList')?.addEventListener('click', () =>
      showView('home')
    );
    document.getElementById('btnOpenReportArchive')?.addEventListener('click', () =>
      showView('reportArchive')
    );
    document.getElementById('btnDeletePatient')?.addEventListener('click', handleDeleteSelectedPatient);
    document.getElementById('btnClearPatients')?.addEventListener('click', handleClearPatients);
    document.getElementById('btnBackReport')?.addEventListener('click', () =>
      showView('patientList')
    );
    document.getElementById('btnBackReportArchive')?.addEventListener('click', () =>
      showView('patientList')
    );
    document.getElementById('btnBackEngineer')?.addEventListener('click', () =>
      showLoginOverlay()
    );
    document.getElementById('btnRefreshReportArchive')?.addEventListener('click', () =>
      loadReportArchive()
    );
    document.getElementById('btnPrintArchiveReport')?.addEventListener('click', handlePrintArchiveReport);
    document.getElementById('btnDeleteReport')?.addEventListener('click', handleDeleteSelectedReport);
    document.getElementById('btnClearReports')?.addEventListener('click', handleClearReports);
    document.getElementById('btnExportPdf')?.addEventListener('click', handleExportReportPdf);
    document.getElementById('btnPrintReport')?.addEventListener('click', handlePrintReport);
    document.getElementById('btnGoPatientList')?.addEventListener('click', () => {
      ensurePatientsLoaded();
      showView('patientList');
    });
    document.getElementById('patientForm')?.addEventListener('submit', handlePatientSubmit);
    document.getElementById('patientId')?.addEventListener('click', async () => {
      await ensurePatientsLoaded();
      setPatientIdValue();
      const input = document.getElementById('patientId');
      if (input) setKeyboardTarget(input);
    });
    document.getElementById('patientBirth')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      hideKeyboard();
      const val = e.currentTarget?.value || '';
      openDatePicker(val);
    });
    document.getElementById('datePrevMonth')?.addEventListener('click', () => {
      datePickerState.month -= 1;
      if (datePickerState.month < 0) {
        datePickerState.month = 11;
        datePickerState.year -= 1;
      }
      renderDatePicker();
    });
    document.getElementById('dateNextMonth')?.addEventListener('click', () => {
      datePickerState.month += 1;
      if (datePickerState.month > 11) {
        datePickerState.month = 0;
        datePickerState.year += 1;
      }
      renderDatePicker();
    });
    document.getElementById('datePickerToday')?.addEventListener('click', () => {
      const today = new Date();
      datePickerState.year = today.getFullYear();
      datePickerState.month = today.getMonth();
      datePickerState.selected = formatDateYMD(today);
      const input = document.getElementById('patientBirth');
      if (input) input.value = datePickerState.selected;
      closeDatePicker();
    });
    document.getElementById('datePickerTitle')?.addEventListener('click', () => {
      datePickerState.view = datePickerState.view === 'year' ? 'calendar' : 'year';
      renderDatePicker();
    });
    document.getElementById('datePickerBack')?.addEventListener('click', () => {
      datePickerState.view = 'calendar';
      renderDatePicker();
    });
    document.getElementById('datePickerCancel')?.addEventListener('click', closeDatePicker);
    document.getElementById('datePickerModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'datePickerModal') closeDatePicker();
    });

    document.getElementById('btnStartStop')?.addEventListener('click', () => {
      console.info('[PPHC] start/stop clicked, connected=', state.connected, 'running=', state.running);
      if (!state.connected) return;
      if (state.running) {
        api.sendU8(0x10c2, 1);
        state.running = false;
        state.activeSides = [];
        state.shieldDropShown = false;
        setModeStage('--');
        if (state.countdownTimer) {
          clearInterval(state.countdownTimer);
          state.countdownTimer = null;
        }
        updateRunState();
        showAlert('治疗已停止');
        playSound('stop');
      } else {
        handleStartClick();
      }
    });

    const pressureSlider = document.getElementById('pressMmHg');
    if (pressureSlider)
      pressureSlider.addEventListener('input', () => {
        const val = Number(pressureSlider.value).toFixed(0);
        const chip = document.getElementById('pressMmHgValue');
        if (chip) chip.textContent = `${val} mmHg`;
        if (!state.running) state.targets.pressure = Number(val);
      });

    const durationSlider = document.getElementById('treatDuration');
    if (durationSlider)
      durationSlider.addEventListener('input', () => {
        const min = Math.max(1, Math.min(15, Number(durationSlider.value || 10)));
        const durationNode = document.getElementById('durationValue');
        if (durationNode) durationNode.textContent = `${min} min`;
        if (!state.running) {
          const node = document.getElementById('countdown');
          if (node) node.textContent = `${String(min).padStart(2, '0')}:00`;
        }
      });

    document.getElementById('modalClose')?.addEventListener('click', () => {
      const modal = document.getElementById('shieldModal');
      if (modal) modal.hidden = true;
    });
    document.getElementById('shieldModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'shieldModal') e.currentTarget.hidden = true;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('shieldModal');
        if (modal && !modal.hidden) modal.hidden = true;
        const confirm = document.getElementById('shieldConfirm');
        if (confirm && !confirm.hidden) confirm.hidden = true;
        const lost = document.getElementById('shieldLostModal');
        if (lost && !lost.hidden) lost.hidden = true;
        const exportModal = document.getElementById('exportAfterTreatmentModal');
        if (exportModal && !exportModal.hidden) exportModal.hidden = true;
        state.pendingSides = null;
      }
    });
    document.getElementById('shieldConfirm')?.addEventListener('click', (e) => {
      if (e.target.id === 'shieldConfirm') {
        e.currentTarget.hidden = true;
        state.pendingSides = null;
      }
    });
    document.getElementById('confirmCancel')?.addEventListener('click', () => {
      const modal = document.getElementById('shieldConfirm');
      if (modal) modal.hidden = true;
      state.pendingSides = null;
    });
    document.getElementById('confirmContinue')?.addEventListener('click', () => {
      const modal = document.getElementById('shieldConfirm');
      if (modal) modal.hidden = true;
      if (state.pendingSides) startTreatmentForSides(state.pendingSides);
      state.pendingSides = null;
    });
    document.getElementById('shieldLostBack')?.addEventListener('click', () => {
      clearShieldLostModal();
    });

    document.getElementById('btnExportAfterNo')?.addEventListener('click', () => {
      closeExportAfterTreatmentModal();
    });
    document.getElementById('btnExportAfterYes')?.addEventListener('click', () => {
      confirmExportAfterTreatment();
    });
    document.getElementById('exportAfterTreatmentModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'exportAfterTreatmentModal') closeExportAfterTreatmentModal();
    });

    document.getElementById('btnBackSettings')?.addEventListener('click', () =>
      showView('home')
    );
    console.info('[PPHC] events bound done');
  }

  function wireIpc() {
    api.onSerialData(({ ch, value }) => {
      pushData(ch, value);
    });
    api.onConnectionChanged((on) => setConnected(on));
    if (api.onHeartbeatAck) {
      api.onHeartbeatAck(() => {
        state.lastHeartbeatAck = Date.now();
        updateHeartbeatUI();
      });
    }
    if (api.onSystemState) {
      api.onSystemState((value) => {
        state.systemState = value;
        const sysNode = $('#systemState');
        if (sysNode) sysNode.textContent = value ?? '--';
        if (!state.shieldExplicit && typeof value === 'number') {
          state.shields.left = !!(value & 0x01);
          state.shields.right = !!(value & 0x02);
          renderShieldIndicators();
          if (
            state.running &&
            ((state.activeSides.includes('left') && !isShieldHealthy('left')) ||
              (state.activeSides.includes('right') && !isShieldHealthy('right')))
          ) {
            handleShieldDropOffline();
          }
        }
      });
    }
    if (api.onAlarmState) {
      api.onAlarmState((value) => {
        state.alarmState = value;
        const alarmNode = $('#alarmState');
        if (alarmNode) alarmNode.textContent = value ?? '--';
      });
    }
    if (api.onModeCurves) {
      api.onModeCurves((value) => {
        setModeStage(value);
      });
    }
    if (api.onStopTreatment) {
      api.onStopTreatment(() => {
        if (state.countdownTimer) {
          clearInterval(state.countdownTimer);
          state.countdownTimer = null;
        }
        state.running = false;
        updateRunState();
        showAlert(t('stoppedByDevice'));
        playSound('stop');
      });
    }
    if (api.onShieldState) {
      api.onShieldState(
        ({ left, right, leftPresent, rightPresent, leftFuse, rightFuse }) => {
          state.shieldExplicit = true;
          state.shields.left = !!left;
          state.shields.right = !!right;
          if (leftPresent !== undefined) state.shieldDetail.leftPresent = leftPresent;
          if (rightPresent !== undefined) state.shieldDetail.rightPresent = rightPresent;
          if (leftFuse !== undefined) state.shieldDetail.leftFuse = leftFuse;
          if (rightFuse !== undefined) state.shieldDetail.rightFuse = rightFuse;
          renderShieldIndicators();
          if (isShieldHealthy('left') && isShieldHealthy('right')) {
            clearShieldLostModal();
          }
          if (
            state.running &&
            ((state.activeSides.includes('left') && !isShieldHealthy('left')) ||
              (state.activeSides.includes('right') && !isShieldHealthy('right')))
          ) {
            handleShieldDropOffline();
          }
        }
      );
    }
  }

  function init() {
    console.info('[PPHC] init start');
    initLoginOverlay();
    bindEvents();
    bindOskInputs();
    bindSettingsControls();
    bindEngineerControls();
    wireIpc();
    updateModeMeta();
    updateSettingsUI();
    syncSystemBrightness();
    syncSystemVolume();
    syncPlayChime();
    syncPrinterSelection();
    applyLanguage(state.settings.language || 'zh');
    ensurePatientsLoaded();
    // 默认进入 home
    showView(state.currentView || 'home');
    const tChip = document.getElementById('tempFixedValue');
    if (tChip) tChip.textContent = `${TEMP_FIXED_C.toFixed(1)}℃`;
    if (state.loggedIn) {
      scheduleAutoConnect(0);
      ensureTelemetryLoop();
      startHeroClock();
    }
    console.info('[PPHC] init done');
  }

  window.addEventListener('DOMContentLoaded', init);
})();
