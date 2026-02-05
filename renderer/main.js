(function () {
  if (window.__PPHC_BOOTED__) return;
  window.__PPHC_BOOTED__ = true;

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));
  const api = window.api;
  const WEB_DEBUG = !!window.__PPHC_WEBDEBUG__;
  const ENABLE_BOTTOM_NAV = false;
  const ENABLE_SWIPE_NAV = false;

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
      patientUpdated: '更新成功',
      patientSaveFailed: '保存失败，请重试。',
      patientIdRequired: '请输入患者编号',
      patientIdDuplicate: '患者编号已存在，请更换编号',
      patientNameRequired: '请输入姓名',
      patientNameInvalid: '请输入有效中文姓名',
      patientGenderRequired: '请选择性别',
      patientBirthRequired: '请输入出生日期',
      patientBirthInvalid: '出生日期格式应为 xxxx-xx-xx',
      patientIdLoaded: '已载入历史档案',
      patientIdAvailable: '编号已自动生成',
      patientHistorySummary: '历史治疗记录：{summary}',
      patientHistoryNone: '暂无历史治疗记录',
      patientLoadFailed: '病例读取失败',
      patientId: '患者编号',
      patientName: '姓名',
      patientGender: '性别',
      patientPhone: '联系电话',
      patientTherapist: '治疗师',
      patientDevice: '设备型号',
      patientStatus: '病例状态',
      patientBirth: '出生日期',
      patientNotes: '备注信息',
      patientPhoto: '面部照片',
      patientCreatedAt: '建档日期',
      patientDetail: '详情',
      patientTreat: '治疗',
      patientPageLabel: '（第 {page} 页）',
      patientSelectPage: '全选此页',
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
      quickPatientHistoryEmpty: '暂无历史治疗记录',
      quickPatientHistory: '上次治疗',
      quickPatientSearchPlaceholder: '搜索患者编号/姓名',
      quickPatientSearchEmpty: '未找到匹配患者',
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
      fuseBlown: '失效',
      controlOverline: '控制参数',
      controlTitle: '',
      recommendPlanTitle: '推荐方案',
      recommendPlanDefault: '使用默认参数',
      pressureEyebrow: '目标压力',
      pressureStrong: '',
      durationEyebrow: '治疗时间',
      durationStrong: '',
      durationCurrentLabel: '当前治疗时间',
      durationRemainingLabel: '倒计时剩余时间',
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
      navDevice: '设备',
      navDeviceHint: '连接 / 校准',
      navPrinter: '打印机',
      navPrinterHint: '选择 / 设置',
      navAccounts: '账户',
      navAccountsHint: '退出登录',
      navLanguage: '语言',
      navLanguageHint: '中文 / English',
      navAbout: '关于',
      navAboutHint: '固件版本',
      navHistory: '操作记录',
      navHistoryHint: '撤销 / 恢复',
      navLogs: '日志',
      navLogsHint: '查看 / 导出',
      bottomNavQuick: '治疗',
      bottomNavPatients: '病例',
      bottomNavReports: '报告',
      bottomNavSettings: '设置',
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
      loginSuccess: '登录成功，欢迎 {user}',
      loginResetLink: '忘记密码？重置',
      loginAddUserBtn: '+ 新增用户',
      loginAddUserTitle: '新增用户',
      loginAddUserHint: '仅管理员可新增用户。',
      loginResetTitle: '重置密码',
      loginResetHint: '设置新密码后确认。',
      usernameFormatHint: '用户名需为 6-20 位字母、数字或下划线',
      usernameRequired: '请输入用户名',
      usernameExists: '用户名已存在，请更换用户名',
      usernameNotFound: '账号不存在，请核对后重试',
      passwordRequired: '请输入密码',
      roleAdmin: '管理员',
      roleOperator: '普通用户',
      roleUser: '普通用户',
      accountsRoleLabel: '权限等级',
      accountsAddRoleLabel: '权限等级',
      accountsDeleteImpact: '删除用户仅移除登录权限，不影响病例数据。',
      confirmPassword: '确认密码',
      confirmPasswordPlaceholder: '请输入管理员密码',
      loginAddSuccess: '用户已创建',
      loginAddFailed: '新增用户失败',
      loginResetSuccess: '密码已重置',
      loginResetFailed: '密码重置失败',
      actionCancel: '取消',
      actionSubmit: '提交',
      actionConfirm: '确认',
      adminOnly: '仅管理员可执行此操作',
      treatmentRunningTitle: '正在治疗中',
      treatmentRunningText: '治疗进行中，请先停止治疗。',
      treatmentRunningOk: '确定',
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
      accountsRemoveConfirmTitle: '确认删除用户',
      accountsRemoveConfirmText: '删除用户后将无法登录系统。',
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
      exportReport: '导出',
      exportFormatLabel: '导出格式',
      reportTemplateLabel: '报告模板',
      reportTemplateStandard: '标准',
      reportTemplateCompact: '简洁',
      exportIncludePatient: '患者信息',
      exportIncludeTreatment: '治疗信息',
      exportIncludeTips: '注意事项',
      exportIncludeDisclaimer: '报告说明',
      exportingPdf: '正在导出PDF...',
      exportingReport: '正在导出...',
      exportPdfSuccess: 'PDF已导出',
      exportPdfFailed: 'PDF导出失败',
      exportReportFailed: '导出失败',
      exportReportSuccess: '导出完成',
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
      patientDeleteTitle: '确认删除病例',
      patientDeleteText: '确认删除所选病例？此操作不可恢复。',
      batchExport: '批量导出',
      batchExportNeedSelect: '请先选择要导出的病例',
      batchExportStart: '正在批量导出...',
      batchExportDone: '批量导出完成',
      batchExportFailed: '批量导出失败',
      filterDate: '治疗日期',
      filterId: '患者编号',
      filterName: '姓名',
      filterTherapist: '治疗师',
      filterDevice: '设备型号',
      filterStatus: '病例状态',
      filterReset: '重置筛选',
      filterAll: '全部',
      statusActive: '进行中',
      statusCompleted: '已完成',
      statusArchived: '已归档',
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
      engineerTestLed: '测试灯带',
      engineerNeedConnect: '请先连接设备',
      engineerApplied: '参数已下发',
      displayCardTitle: '显示',
      displayCardDesc: '模仿 macOS 样式的柔和背光与模糊效果。',
      brightnessLabel: '屏幕亮度',
      brightnessHint: '调整 UI 辉度',
      brightnessApplyFailed: '设置亮度失败，请检查权限或背光设备',
      screensaverLabel: '屏保等待',
      screensaverHint: '自动进入屏保的倒计时',
      themeLabel: '界面主题',
      themeHint: '浅色 / 深色',
      themeLight: '浅色',
      themeDark: '深色',
      fontScaleLabel: '字体大小',
      fontScaleHint: '调整显示字号',
      fontScaleSmall: '小',
      fontScaleNormal: '标准',
      fontScaleLarge: '大',
      fontScaleXL: '特大',
      soundTitle: '声音',
      volumeLabel: '系统音量',
      volumeHint: '播放提示与反馈',
      chimeLabel: '提示音',
      chimeHint: '重要操作播放提示',
      pressureAlertSoundLabel: '压力警示音',
      pressureAlertSoundHint: '压力超过目标值 50mmHg 时提示',
      deviceTitle: '设备连接',
      deviceStatusLabel: '设备状态',
      deviceStatusHint: '实时监测连接',
      deviceStatusConnected: '已连接',
      deviceStatusDisconnected: '未连接',
      deviceStatusConnecting: '连接中',
      deviceAutoReconnectLabel: '自动重连',
      deviceAutoReconnectHint: '断开后自动尝试连接',
      deviceReconnectNow: '立即重连',
      deviceCalibrationLabel: '校准提醒',
      deviceCalibrationHint: '定期校准确保压力准确',
      deviceCalibrationNever: '未记录',
      deviceCalibrationAt: '上次 {date}',
      deviceCalibrationDue: '距下次 {days} 天',
      deviceCalibrationOverdue: '已超过 {days} 天',
      deviceCalibrationAction: '已校准',
      deviceCalibrationSet: '校准记录已更新',
      languageTitle: '语言',
      languageDesc: '中英文切换，实时调整界面文案。',
      languageLabel: '界面语言',
      languageHint: '偏好选择',
      langZh: '中文',
      langEn: 'English',
      historyTitle: '操作记录',
      historyEmpty: '暂无操作记录',
      historyDeletePatient: '删除病例',
      historyRestorePatient: '恢复病例',
      historyAutoSave: '自动保存进度',
      historyManualSave: '手动保存进度',
      historyCalibration: '记录设备校准',
      autoSaveTitle: '恢复治疗进度',
      autoSaveText: '检测到未完成的治疗进度，是否恢复？',
      autoSaveRestore: '恢复',
      autoSaveDiscard: '忽略',
      autoSaveSaved: '进度已保存',
      autoSaveRestored: '已恢复上次进度',
      autoSaveDiscarded: '已忽略上次进度',
      autoSaveMeta: '保存时间 {time}',
      manualSave: '保存进度',
      undoDelete: '撤销删除',
      undoReady: '可撤销最近删除',
      undoDone: '已撤销删除',
      undoFailed: '撤销失败',
      undoUnavailable: '暂无可撤销操作',
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
      curveHistory: '历史曲线',
      curveHistoryOn: '历史曲线: 开',
      curveHistoryOff: '历史曲线: 关',
      curveZoomLabel: '缩放 {zoom}x',
      photoModalTitle: '拍照',
      photoCapture: '拍照',
      photoCaptureFailed: '拍照失败',
      photoCaptureNoCamera: '未检测到摄像头',
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
      patientUpdated: 'Updated',
      patientSaveFailed: 'Save failed, try again.',
      patientIdRequired: 'Patient ID is required',
      patientIdDuplicate: 'Patient ID already exists. Choose another.',
      patientNameRequired: 'Name is required',
      patientNameInvalid: 'Enter a valid Chinese name',
      patientGenderRequired: 'Select gender',
      patientBirthRequired: 'Birth date is required',
      patientBirthInvalid: 'Use YYYY-MM-DD format',
      patientIdLoaded: 'Loaded existing record',
      patientIdAvailable: 'ID generated automatically.',
      patientHistorySummary: 'History: {summary}',
      patientHistoryNone: 'No previous treatment record',
      patientLoadFailed: 'Unable to read records',
      patientId: 'Patient ID',
      patientName: 'Name',
      patientGender: 'Gender',
      patientPhone: 'Phone',
      patientTherapist: 'Therapist',
      patientDevice: 'Device Model',
      patientStatus: 'Case Status',
      patientBirth: 'Birth Date',
      patientNotes: 'Notes',
      patientPhoto: 'Photo',
      patientCreatedAt: 'Created',
      patientDetail: 'Details',
      patientTreat: 'Treat',
      patientPageLabel: 'Page {page}',
      patientSelectPage: 'Select This Page',
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
      quickPatientHistoryEmpty: 'No treatment history',
      quickPatientHistory: 'Last session',
      quickPatientSearchPlaceholder: 'Search by ID or name',
      quickPatientSearchEmpty: 'No matching patients',
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
      fuseBlown: 'Fault',
      controlOverline: 'Controls',
      controlTitle: '',
      recommendPlanTitle: 'Recommended Plan',
      recommendPlanDefault: 'Use default parameters',
      pressureEyebrow: 'Target Pressure',
      pressureStrong: '',
      durationEyebrow: 'Duration',
      durationStrong: '',
      durationCurrentLabel: 'Elapsed',
      durationRemainingLabel: 'Remaining',
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
      navDevice: 'Device',
      navDeviceHint: 'Status / Calibration',
      navPrinter: 'Printer',
      navPrinterHint: 'Select / Setup',
      navAccounts: 'Accounts',
      navAccountsHint: 'Logout',
      navLanguage: 'Language',
      navLanguageHint: 'Chinese / English',
      navAbout: 'About',
      navAboutHint: 'Firmware',
      navHistory: 'History',
      navHistoryHint: 'Undo / Restore',
      navLogs: 'Logs',
      navLogsHint: 'View / Export',
      bottomNavQuick: 'Treatment',
      bottomNavPatients: 'Patients',
      bottomNavReports: 'Reports',
      bottomNavSettings: 'Settings',
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
      loginSuccess: 'Login success. Welcome {user}',
      loginResetLink: 'Forgot password? Reset',
      loginAddUserBtn: '+ Add User',
      loginAddUserTitle: 'Add User',
      loginAddUserHint: 'Admin only.',
      loginResetTitle: 'Reset Password',
      loginResetHint: 'Set a new password to reset.',
      usernameFormatHint: 'Username must be 6-20 letters, numbers, or underscore',
      usernameRequired: 'Username required',
      usernameExists: 'Username already exists',
      usernameNotFound: 'Username not found',
      passwordRequired: 'Password required',
      roleAdmin: 'Admin',
      roleOperator: 'User',
      roleUser: 'User',
      accountsRoleLabel: 'Role',
      accountsAddRoleLabel: 'Role',
      accountsDeleteImpact: 'Removing a user only revokes login access.',
      confirmPassword: 'Confirm password',
      confirmPasswordPlaceholder: 'Enter admin password',
      loginAddSuccess: 'User created',
      loginAddFailed: 'Add user failed',
      loginResetSuccess: 'Password reset',
      loginResetFailed: 'Password reset failed',
      actionCancel: 'Cancel',
      actionSubmit: 'Submit',
      actionConfirm: 'Confirm',
      adminOnly: 'Admin only',
      treatmentRunningTitle: 'Treatment Running',
      treatmentRunningText: 'Treatment is in progress. Please stop it first.',
      treatmentRunningOk: 'OK',
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
      accountsRemoveConfirmTitle: 'Confirm User Removal',
      accountsRemoveConfirmText: 'The user will no longer be able to log in.',
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
      exportReport: 'Export',
      exportFormatLabel: 'Format',
      reportTemplateLabel: 'Report Template',
      reportTemplateStandard: 'Standard',
      reportTemplateCompact: 'Compact',
      exportIncludePatient: 'Patient Info',
      exportIncludeTreatment: 'Treatment Info',
      exportIncludeTips: 'Care Tips',
      exportIncludeDisclaimer: 'Disclaimer',
      exportingPdf: 'Exporting PDF...',
      exportingReport: 'Exporting...',
      exportPdfSuccess: 'PDF exported',
      exportPdfFailed: 'PDF export failed',
      exportReportFailed: 'Export failed',
      exportReportSuccess: 'Export complete',
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
      patientDeleteTitle: 'Confirm Case Deletion',
      patientDeleteText: 'Delete selected cases? This cannot be undone.',
      batchExport: 'Batch Export',
      batchExportNeedSelect: 'Select cases to export',
      batchExportStart: 'Batch export in progress...',
      batchExportDone: 'Batch export complete',
      batchExportFailed: 'Batch export failed',
      filterDate: 'Treatment Date',
      filterId: 'Patient ID',
      filterName: 'Name',
      filterTherapist: 'Therapist',
      filterDevice: 'Device Model',
      filterStatus: 'Case Status',
      filterReset: 'Reset Filters',
      filterAll: 'All',
      statusActive: 'Active',
      statusCompleted: 'Completed',
      statusArchived: 'Archived',
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
      engineerTestLed: 'Test LEDs',
      engineerNeedConnect: 'Connect device first',
      engineerApplied: 'Parameters sent',
      displayCardTitle: 'Display',
      displayCardDesc: 'macOS-inspired soft lighting and glassy blur.',
      brightnessLabel: 'Brightness',
      brightnessHint: 'Adjust UI luminance',
      brightnessApplyFailed: 'Failed to set brightness. Check permission or backlight device.',
      screensaverLabel: 'Screen Saver',
      screensaverHint: 'Idle timeout before saver',
      themeLabel: 'Theme',
      themeHint: 'Light / Dark',
      themeLight: 'Light',
      themeDark: 'Dark',
      fontScaleLabel: 'Font Size',
      fontScaleHint: 'Scale UI typography',
      fontScaleSmall: 'Small',
      fontScaleNormal: 'Normal',
      fontScaleLarge: 'Large',
      fontScaleXL: 'Extra Large',
      soundTitle: 'Sound',
      volumeLabel: 'System Volume',
      volumeHint: 'Prompts and feedback',
      chimeLabel: 'Chime',
      chimeHint: 'Play prompts on key actions',
      pressureAlertSoundLabel: 'Pressure Alert Sound',
      pressureAlertSoundHint: 'Alert when pressure exceeds target by 50 mmHg',
      deviceTitle: 'Device',
      deviceStatusLabel: 'Status',
      deviceStatusHint: 'Real-time connection',
      deviceStatusConnected: 'Connected',
      deviceStatusDisconnected: 'Disconnected',
      deviceStatusConnecting: 'Connecting',
      deviceAutoReconnectLabel: 'Auto Reconnect',
      deviceAutoReconnectHint: 'Retry when disconnected',
      deviceReconnectNow: 'Reconnect Now',
      deviceCalibrationLabel: 'Calibration Reminder',
      deviceCalibrationHint: 'Keep pressure accuracy',
      deviceCalibrationNever: 'Not recorded',
      deviceCalibrationAt: 'Last {date}',
      deviceCalibrationDue: '{days} days until due',
      deviceCalibrationOverdue: '{days} days overdue',
      deviceCalibrationAction: 'Mark Calibrated',
      deviceCalibrationSet: 'Calibration updated',
      languageTitle: 'Language',
      languageDesc: 'Switch between Chinese and English instantly.',
      languageLabel: 'Interface Language',
      languageHint: 'Preference',
      langZh: '中文',
      langEn: 'English',
      historyTitle: 'Operation History',
      historyEmpty: 'No history yet',
      historyDeletePatient: 'Delete patient',
      historyRestorePatient: 'Restore patient',
      historyAutoSave: 'Auto-save progress',
      historyManualSave: 'Manual save',
      historyCalibration: 'Calibration recorded',
      autoSaveTitle: 'Restore Progress',
      autoSaveText: 'Detected unfinished progress. Restore now?',
      autoSaveRestore: 'Restore',
      autoSaveDiscard: 'Dismiss',
      autoSaveSaved: 'Progress saved',
      autoSaveRestored: 'Progress restored',
      autoSaveDiscarded: 'Progress discarded',
      autoSaveMeta: 'Saved at {time}',
      manualSave: 'Save Progress',
      undoDelete: 'Undo Delete',
      undoReady: 'Undo available',
      undoDone: 'Undo complete',
      undoFailed: 'Undo failed',
      undoUnavailable: 'Nothing to undo',
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
      curveHistory: 'History Curves',
      curveHistoryOn: 'History: On',
      curveHistoryOff: 'History: Off',
      curveZoomLabel: 'Zoom {zoom}x',
      photoModalTitle: 'Camera',
      photoCapture: 'Capture',
      photoCaptureFailed: 'Capture failed',
      photoCaptureNoCamera: 'No camera detected',
    },
  };

let currentLang = 'zh';
const t = (key) => (TRANSLATIONS?.[currentLang] || TRANSLATIONS.zh)[key] || key;

const VIEWS = ['home', 'quick', 'settings', 'newPatient', 'patientList', 'report', 'reportArchive', 'engineer'];
const VIEW_CLASSES = VIEWS.map((v) => `view-${v}`);
const NAV_SEQUENCE = ['quick', 'patientList', 'reportArchive', 'settings'];

  const MODE = { target: 20, t1: 25, t2: 35, t3: 50 };
  const TEMP_FIXED_C = 42.0;
  const FIXED_PRESSURE_MMHG = 274;
  const PRESSURE_ALERT_OFFSET = 50;
  const PRESSURE_ALERT_FALLBACK = FIXED_PRESSURE_MMHG;
  const PRESSURE_ALERT_SOUND_COOLDOWN = 5000;
  const AUTO_PORT = '/dev/ttyS1';
  const AUTO_BAUD = 115200;
  const audioMap = {
    shield: new Audio('../resoure/shield-is-invalid.wav'),
    start: new Audio('../resoure/Treatment-start.wav'),
    stop: new Audio('../resoure/Treatment-stop.wav'),
    tempHigh: new Audio('../resoure/Temperature-high.wav'),
    pressureHigh: new Audio('../resoure/pressure_woring.wav'),
  };
  const STARTUP_AUDIO_ENABLED = false;
  let startupAudioPlayed = false;
  const logToMain = (level, message, stack) => {
    if (api?.logToMain) {
      api.logToMain({ level, message, stack });
      return;
    }
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(message, stack || '');
  };
  const playHtmlAudioSample = (key) =>
    new Promise((resolve) => {
      const src = audioMap[key]?.src;
      if (!src) return resolve({ ok: false, error: 'missing audio source' });
      const audio = new Audio(src);
      audio.preload = 'auto';
      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
      };
      audio.onended = () => {
        cleanup();
        resolve({ ok: true });
      };
      audio.onerror = () => {
        cleanup();
        resolve({ ok: false, error: 'html5 audio error' });
      };
      try {
        const playRes = audio.play();
        if (playRes && typeof playRes.catch === 'function') {
          playRes.catch((err) => {
            cleanup();
            resolve({ ok: false, error: err?.message || String(err) });
          });
        }
      } catch (err) {
        cleanup();
        resolve({ ok: false, error: err?.message || String(err) });
      }
    });

  async function runStartupAudioProbe() {
    if (startupAudioPlayed) return;
    startupAudioPlayed = true;
    const keys = Object.keys(audioMap);
    if (!keys.length) return;
    const key = keys[Math.floor(Math.random() * keys.length)];
    logToMain('info', `[audio-probe] start key=${key}`);
    let apiResult = null;
    if (api?.playPromptSound) {
      try {
        apiResult = await api.playPromptSound(key);
      } catch (err) {
        logToMain('warn', `[audio-probe] api.playPromptSound failed`, err?.message || String(err));
      }
    }
    if (apiResult?.ok) {
      logToMain('info', `[audio-probe] ok via main player key=${key}`);
      return;
    }
    if (apiResult) {
      logToMain(
        'warn',
        `[audio-probe] main player failed key=${key}`,
        apiResult.error || apiResult.code || ''
      );
    }
    const fallback = await playHtmlAudioSample(key);
    if (fallback.ok) {
      logToMain('info', `[audio-probe] ok via html5 audio key=${key}`);
      return;
    }
    logToMain('error', `[audio-probe] html5 audio failed key=${key}`, fallback.error || '');
  }
  const playSound = (key) => {
    if (key === 'pressureHigh') {
      if (!state.settings.pressureAlertSound) return;
    } else if (!state.settings.playChime) {
      return;
    }
    const playFallback = () => {
      const a = audioMap[key];
      if (!a || typeof a.play !== 'function') return;
      try {
        a.currentTime = 0;
        a.play().catch((err) => {
          if (WEB_DEBUG) console.warn('[PPHC] audio play failed', key, err?.message || err);
        });
      } catch {}
    };
    const mainPlay = api?.playPromptSound;
    if (typeof mainPlay === 'function') {
      try {
        const res = mainPlay(key);
        if (res && typeof res.then === 'function') {
          res
            .then((out) => {
              if (!out || !out.ok) playFallback();
            })
            .catch(() => playFallback());
          return;
        }
        return;
      } catch {}
    }
    playFallback();
  };
  if (WEB_DEBUG) {
    console.log('[PPHC] web debug mode enabled - serial and device calls are stubbed');
  }

  const LOGIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin',
  };
  const USERNAME_RE = /^[A-Za-z0-9_]{6,20}$/;
  const LOGIN_TOAST_DURATION = 3000;
  const LOGIN_SUCCESS_DELAY = 200;
  const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;
  const AUTO_SAVE_KEY = 'pphc.autosave';
  const OP_HISTORY_KEY = 'pphc.history';
  const MAX_HISTORY = 80;
  const PATIENT_LIST_PAGE_SIZE = 10;
  const CALIBRATION_INTERVAL_DAYS = 180;

  const KEYBOARD_LAYOUTS = {
    en: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Space', '←', 'Clear', 'Enter'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', '@', '.'],
    ],
    zh: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Space', '←', 'Clear', '确认'],
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
    loginPendingTimer: null,
    connected: false,
    connecting: false,
    autoConnectTimer: null,
    heroClockTimer: null,
    mode: 1,
    running: false,
    countdownTimer: null,
    telemetryTimer: null,
    autoSaveTimer: null,
    countdownEnd: 0,
    countdownStart: 0,
    countdownTotalMs: 0,
    heartbeatTimer: null,
    heartbeatSeed: 0x55,
    lastHeartbeatAck: 0,
    buf: { 0: [], 1: [], 2: [], 3: [] },
    latest: { 0: null, 1: null, 2: null, 3: null },
    max: 360,
    currentView: 'home',
    settingsActiveModule: 'accounts',
    reportTemplate: 'standard',
    curveZoomLevels: [1, 2, 4],
    curveZoom: 1,
    historyEnabled: false,
    historyBufs: { 0: [], 1: [], 2: [], 3: [] },
    patients: [],
    patientsLoaded: false,
    activePatient: null,
    lastTreatment: null,
    newPatientPhoto: null,
    editingPatientId: null,
    lastAppliedPatientId: null,
    quickPatientQuery: '',
    selectedPatientIds: [],
    pendingPatientDeleteIds: [],
    undoSnapshot: null,
    pendingAutosave: null,
    operationHistory: [],
    patientIdCheckTimer: null,
    patientFilters: {
      startDate: '',
      endDate: '',
      patientId: '',
      name: '',
      therapist: '',
      deviceModel: '',
    },
    patientListPage: null,
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
    pressureAlerted: { left: false, right: false },
    pressureAlertLastSound: 0,
    settings: {
      brightness: 80,
      screensaver: 10,
      volume: 60,
      language: 'zh',
      autoConnect: true,
      theme: 'dark',
      fontScale: 1,
      lastCalibrationAt: null,
      appVersion: '0.1.0',
      firmwareVersion: '1.2.3',
      playChime: true,
      pressureAlertSound: true,
      printerName: '',
    },
    targets: {
      pressure: FIXED_PRESSURE_MMHG,
      temp: TEMP_FIXED_C,
      durationMin: 12,
    },
  };

  const keyboardState = {
    lang: 'en',
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

  // Pinyin dictionary populated from @pinyin-pro/data (modern.json for faster load).
  let PINYIN_INDEX = null;
  let PINYIN_PREFIX_INDEX = null;
  let PINYIN_LOAD_PROMISE = null;
  const PINYIN_DICT_URL = new URL(
    '../node_modules/@pinyin-pro/data/json/modern.json',
    window.location.href
  ).toString();


  let brightnessApplyTimer = null;
  let volumeApplyTimer = null;
  const MIN_BRIGHTNESS = 15;
  const clampBrightness = (val) =>
    Math.max(MIN_BRIGHTNESS, Math.min(100, Math.round(Number(val) || 0)));
  const clampVolume = (val) => Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
  const clampFontScale = (val) => Math.max(0.8, Math.min(1.3, Number(val) || 1));

  function canAccessView(view) {
    const role = state.user?.role || 'user';
    if (view === 'engineer') return role === 'engineer';
    return true;
  }

  function showView(view) {
    const prev = state.currentView;
    const candidate = VIEWS.includes(view) ? view : 'home';
    const fallback = 'home';
    const next = canAccessView(candidate) ? candidate : fallback;
    if (state.running && next !== state.currentView) {
      showTreatmentRunningModal();
      return;
    }
    state.currentView = next;
    const shell = document.querySelector('.app-shell');
    if (shell) shell.setAttribute('data-view', next);
    document.body.classList.remove(...VIEW_CLASSES);
    document.body.classList.add(`view-${next}`);
    if (prev !== next) hideKeyboard();
    if (next === 'settings') {
      updateSettingsUI();
      setSettingsModule(state.settingsActiveModule || 'accounts');
    } else if (next === 'quick') {
      ensurePatientsLoaded().then(() => {
        if (state.currentView === 'quick') renderQuickPatientPicker();
      });
      renderQuickPatientPicker();
      checkAutoSaveRestore();
    } else if (next === 'newPatient') {
      ensurePatientsLoaded();
      resetPatientForm();
    } else if (next === 'patientList') {
      ensurePatientsLoaded();
      state.patientListPage = null;
      renderPatientList();
    } else if (next === 'report') {
      renderReport();
    } else if (next === 'reportArchive') {
      loadReportArchive();
    } else if (next === 'engineer') {
      renderEngineer();
    }
    updateBottomNav();
    const titleMap = {
      home: t('homeTitle'),
      quick: t('quickTitle'),
      patientList: t('patientListTitle'),
      reportArchive: t('reportArchiveTitle'),
      report: t('reportScreenTitle'),
      settings: t('settingsTitle'),
      newPatient: t('newPatientTitle'),
      engineer: t('engineerTitle'),
    };
    if (titleMap[next]) document.title = titleMap[next];
    console.info('[PPHC] view ->', next);
  }

  function getActiveNavView(view = state.currentView) {
    if (view === 'report' || view === 'reportArchive') return 'reportArchive';
    if (view === 'newPatient' || view === 'patientList') return 'patientList';
    if (view === 'engineer') return 'settings';
    return NAV_SEQUENCE.includes(view) ? view : null;
  }

  function getNavSequence() {
    return NAV_SEQUENCE.filter((item) => canAccessView(item));
  }

  function updateBottomNav() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;
    if (!ENABLE_BOTTOM_NAV) {
      nav.hidden = true;
      return;
    }
    const activeView = getActiveNavView();
    nav.hidden = !state.loggedIn;
    nav.querySelectorAll('.nav-item').forEach((btn) => {
      const view = btn.dataset.view;
      btn.hidden = !view || !canAccessView(view);
      btn.classList.toggle('active', !!view && view === activeView);
    });
  }

  function bindBottomNav() {
    if (!ENABLE_BOTTOM_NAV) return;
    const nav = document.getElementById('bottomNav');
    if (!nav || nav._bound) return;
    nav._bound = true;
    nav.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.running) {
          showTreatmentRunningModal();
          return;
        }
        const view = btn.dataset.view;
        if (!view) return;
        showView(view);
      });
    });
  }

  function isModalOpen() {
    return !!document.querySelector('.modal:not([hidden])');
  }

  function shouldHandleSwipe(target) {
    if (!state.loggedIn) return false;
    if (!NAV_SEQUENCE.includes(state.currentView)) return false;
    if (document.body.classList.contains('login-locked')) return false;
    if (document.body.classList.contains('keyboard-open')) return false;
    if (isModalOpen()) return false;
    if (target && target.closest('input, textarea, select, button, .osk, .custom-select, .date-picker-modal, .modal')) {
      return false;
    }
    return true;
  }

  function bindSwipeNav() {
    if (!ENABLE_SWIPE_NAV) return;
    if (document.body._swipeNavBound) return;
    document.body._swipeNavBound = true;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;
    let touchId = null;
    document.addEventListener(
      'touchstart',
      (e) => {
        if (!shouldHandleSwipe(e.target)) return;
        if (!e.touches || e.touches.length !== 1) {
          tracking = false;
          touchId = null;
          return;
        }
        const touch = e.touches[0];
        tracking = true;
        touchId = touch.identifier;
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      },
      { passive: true }
    );
    document.addEventListener('touchend', (e) => {
      if (!tracking) return;
      if (e.touches && e.touches.length > 0) {
        tracking = false;
        touchId = null;
        return;
      }
      const changed = e.changedTouches || [];
      let touch = null;
      for (let i = 0; i < changed.length; i += 1) {
        if (touchId == null || changed[i].identifier === touchId) {
          touch = changed[i];
          break;
        }
      }
      tracking = false;
      touchId = null;
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startTime;
      if (dt > 800) return;
      if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy)) return;
      const sequence = getNavSequence();
      if (sequence.length < 2) return;
      const activeView = getActiveNavView() || sequence[0];
      const idx = Math.max(0, sequence.indexOf(activeView));
      const nextIndex = dx < 0 ? Math.min(sequence.length - 1, idx + 1) : Math.max(0, idx - 1);
      if (nextIndex === idx) return;
      showView(sequence[nextIndex]);
    });
    document.addEventListener('touchcancel', () => {
      tracking = false;
      touchId = null;
    });
  }

  function computeNextPatientId() {
    const nums = (state.patients || [])
      .map((p) => Number(String(p?.id || '').replace(/\D/g, '')))
      .filter((n) => Number.isFinite(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `P${String(next).padStart(4, '0')}`;
  }

  function normalizePatientIdInput(raw) {
    const text = String(raw || '').trim();
    if (!text) return '';
    const compact = text.replace(/\s+/g, '');
    if (/^\d+$/.test(compact)) {
      return `P${compact.padStart(4, '0')}`;
    }
    return compact.toUpperCase();
  }

  function safeStorageGet(key) {
    try {
      const raw = window.localStorage?.getItem?.(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage?.setItem?.(key, JSON.stringify(value));
    } catch {}
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage?.removeItem?.(key);
    } catch {}
  }

  function loadOperationHistory() {
    const raw = safeStorageGet(OP_HISTORY_KEY);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => ({
        type: String(item?.type || '').trim(),
        detail: String(item?.detail || '').trim(),
        time: Number(item?.time) || Date.now(),
      }))
      .filter((item) => item.type);
  }

  function recordOperation(type, detail = '') {
    const entry = {
      type: String(type || '').trim(),
      detail: String(detail || '').trim(),
      time: Date.now(),
    };
    if (!entry.type) return;
    state.operationHistory = [entry, ...(state.operationHistory || [])].slice(0, MAX_HISTORY);
    safeStorageSet(OP_HISTORY_KEY, state.operationHistory);
    renderOperationHistory();
  }

  function renderOperationHistory() {
    const listNode = document.getElementById('historyList');
    if (!listNode) return;
    const history = Array.isArray(state.operationHistory) ? state.operationHistory : [];
    listNode.innerHTML = '';
    if (!history.length) {
      listNode.innerHTML = `<div class="empty-tip">${t('historyEmpty')}</div>`;
      return;
    }
    history.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'history-item';
      const label = document.createElement('span');
      let title = '';
      if (item.type === 'patient-delete') title = t('historyDeletePatient');
      else if (item.type === 'patient-restore') title = t('historyRestorePatient');
      else if (item.type === 'auto-save') title = t('historyAutoSave');
      else if (item.type === 'manual-save') title = t('historyManualSave');
      else if (item.type === 'calibration') title = t('historyCalibration');
      else title = item.type;
      label.textContent = item.detail ? `${title} · ${item.detail}` : title;
      const meta = document.createElement('small');
      meta.textContent = new Date(item.time).toLocaleString();
      row.append(label, meta);
      listNode.appendChild(row);
    });
  }

  function clampNumber(val, min, max, fallback) {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  function collectAutoSaveSnapshot(manual = false) {
    const patientId = String(state.treatmentPatientId || state.activePatient?.id || '').trim();
    const durationSlider = document.getElementById('treatDuration');
    const duration = clampNumber(
      durationSlider?.value ?? state.targets.durationMin,
      Number(durationSlider?.min ?? 0),
      Number(durationSlider?.max ?? 12),
      0
    );
    const remainingMs =
      state.running && state.countdownEnd ? Math.max(0, state.countdownEnd - Date.now()) : 0;
    return {
      savedAt: new Date().toISOString(),
      patientId: patientId || null,
      pressure: FIXED_PRESSURE_MMHG,
      duration,
      remainingMs,
      running: !!state.running,
      sides: Array.isArray(state.activeSides) ? state.activeSides.slice() : [],
      manual: !!manual,
    };
  }

  function saveAutoProgress({ manual = false } = {}) {
    const snapshot = collectAutoSaveSnapshot(manual);
    if (!snapshot.patientId && !snapshot.running && !manual) return false;
    safeStorageSet(AUTO_SAVE_KEY, snapshot);
    if (manual) {
      showAlert(t('autoSaveSaved'), 2500, 'success');
      recordOperation('manual-save', snapshot.patientId || '');
    } else {
      recordOperation('auto-save', snapshot.patientId || '');
    }
    return true;
  }

  function startAutoSaveTimer() {
    stopAutoSaveTimer();
    saveAutoProgress({ manual: false });
    state.autoSaveTimer = setInterval(() => {
      saveAutoProgress({ manual: false });
    }, AUTO_SAVE_INTERVAL);
  }

  function stopAutoSaveTimer() {
    if (state.autoSaveTimer) {
      clearInterval(state.autoSaveTimer);
      state.autoSaveTimer = null;
    }
  }

  function clearAutoSaveSnapshot() {
    safeStorageRemove(AUTO_SAVE_KEY);
  }

  function loadAutoSaveSnapshot() {
    const snapshot = safeStorageGet(AUTO_SAVE_KEY);
    if (!snapshot || typeof snapshot !== 'object') return null;
    if (!snapshot.patientId && !snapshot.running && !snapshot.manual) return null;
    return snapshot;
  }

  function updateCountdownDisplay(remainingMs) {
    const node = document.getElementById('countdown');
    if (!node) return;
    const sec = Math.max(0, Math.ceil((remainingMs || 0) / 1000));
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    node.textContent = `${m}:${s}`;
  }

  function updateDurationTargetDisplay(minutes) {
    const node = document.getElementById('durationTargetValue');
    if (!node) return;
    const safeMin = Math.max(0, Math.min(12, Number(minutes || 0)));
    const m = Math.floor(safeMin).toString().padStart(2, '0');
    node.textContent = `${m}:00`;
  }

  function updateElapsedDisplay(elapsedMs) {
    const node = document.getElementById('elapsedTime');
    if (!node) return;
    const sec = Math.max(0, Math.floor((elapsedMs || 0) / 1000));
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    node.textContent = `${m}:${s}`;
  }

  function openAutoSaveRestoreModal(snapshot) {
    const modal = document.getElementById('autosaveRestoreModal');
    if (!modal) return;
    state.pendingAutosave = snapshot;
    const meta = document.getElementById('autosaveRestoreMeta');
    if (meta) {
      const savedTime = snapshot?.savedAt ? new Date(snapshot.savedAt).toLocaleString() : '--';
      const patient = snapshot?.patientId ? getPatientById(snapshot.patientId) : null;
      const label = t('autoSaveMeta').replace('{time}', savedTime);
      if (patient && (patient.id || patient.name)) {
        meta.textContent = `${label} · ${[patient.id, patient.name].filter(Boolean).join(' · ')}`;
      } else if (snapshot?.patientId) {
        meta.textContent = `${label} · ${snapshot.patientId}`;
      } else {
        meta.textContent = label;
      }
    }
    modal.hidden = false;
  }

  function closeAutoSaveRestoreModal() {
    const modal = document.getElementById('autosaveRestoreModal');
    if (modal) modal.hidden = true;
  }

  async function restoreAutoSaveSnapshot() {
    const snapshot = state.pendingAutosave;
    if (!snapshot) return;
    await ensurePatientsLoaded();
    const patientId = String(snapshot.patientId || '').trim();
    const activePatient = patientId ? getPatientById(patientId) : null;
    if (patientId) {
      state.treatmentPatientId = patientId;
      state.activePatient = activePatient || state.activePatient;
      state.lastAppliedPatientId = patientId;
    }
    const durationSlider = document.getElementById('treatDuration');
    state.targets.pressure = FIXED_PRESSURE_MMHG;
    if (durationSlider) {
      const restoreDuration = Math.max(0, Math.min(12, Number(snapshot.duration ?? durationSlider.value ?? 0)));
      durationSlider.value = String(restoreDuration);
      state.targets.durationMin = restoreDuration;
    }
    updateModeMeta();
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
    const shouldResume = !!snapshot.running && Number(snapshot.remainingMs) > 0;
    state.running = shouldResume;
    if (shouldResume) {
      const totalMs = Math.max(0, Number(state.targets.durationMin || 0) * 60 * 1000);
      const remainingMs = Math.max(0, Number(snapshot.remainingMs || 0));
      state.countdownTotalMs = totalMs;
      state.countdownEnd = Date.now() + remainingMs;
      state.countdownStart = Date.now() - Math.max(0, totalMs - remainingMs);
      state.activeSides = Array.isArray(snapshot.sides) ? snapshot.sides.slice() : state.activeSides;
      state.countdownTimer = setInterval(updateCountdown, 250);
      updateCountdownDisplay(remainingMs);
      updateElapsedDisplay(Math.max(0, totalMs - remainingMs));
    } else {
      state.countdownEnd = 0;
      state.countdownStart = 0;
      state.countdownTotalMs = 0;
      state.activeSides = [];
      updateElapsedDisplay(0);
    }
    updateRunState();
    updateRecommendedPlan(activePatient);
    renderQuickPatientPicker();
    showView('quick');
    clearAutoSaveSnapshot();
    state.pendingAutosave = null;
    closeAutoSaveRestoreModal();
    showAlert(t('autoSaveRestored'), 3000, 'success');
  }

  function discardAutoSaveSnapshot() {
    clearAutoSaveSnapshot();
    state.pendingAutosave = null;
    closeAutoSaveRestoreModal();
    showAlert(t('autoSaveDiscarded'), 2500, 'info');
  }

  async function checkAutoSaveRestore() {
    const snapshot = loadAutoSaveSnapshot();
    if (!snapshot) return;
    clearAutoSaveSnapshot();
    state.pendingAutosave = null;
    closeAutoSaveRestoreModal();
  }

  function updateUndoButton() {
    const btn = document.getElementById('btnUndoPatientDelete');
    if (!btn) return;
    const canUndo = !!(state.undoSnapshot && state.undoSnapshot.items?.length);
    btn.disabled = !canUndo;
  }

  function setUndoSnapshot(items) {
    state.undoSnapshot = Array.isArray(items) && items.length ? { items, time: Date.now() } : null;
    updateUndoButton();
  }

  async function handleUndoPatientDelete() {
    if (!state.undoSnapshot?.items?.length) {
      showAlert(t('undoUnavailable'), 2500, 'info');
      return;
    }
    try {
      const res = await api?.restorePatients?.(state.undoSnapshot.items);
      if (res?.success) {
        await ensurePatientsLoaded();
        renderPatientList();
        renderQuickPatientPicker();
        recordOperation('patient-restore', `+${state.undoSnapshot.items.length}`);
        setUndoSnapshot(null);
        showAlert(t('undoDone'), 3000, 'success');
      } else {
        showAlert(t('undoFailed'), 3000, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] undo restore failed', err);
      showAlert(t('undoFailed'), 3000, 'error');
    }
  }

  function setPatientIdValue() {
    const input = document.getElementById('patientId');
    if (!input) return null;
    const next = computeNextPatientId();
    input.value = next;
    return next;
  }

  async function checkPatientIdInput(opts = {}) {
    const skipFill = !!opts.skipFill;
    const input = document.getElementById('patientId');
    if (!input) return;
    if (input.hasAttribute('readonly')) {
      if (!input.value) input.value = computeNextPatientId();
      setPatientIdHint(t('patientIdAvailable'), false);
      return;
    }
    const normalized = normalizePatientIdInput(input.value);
    if (normalized && normalized !== input.value) input.value = normalized;
    if (!normalized) {
      setPatientIdHint(null);
      if (!skipFill) state.editingPatientId = null;
      return;
    }
    await ensurePatientsLoaded();
    const existing = getPatientById(normalized);
    if (existing) {
      if (skipFill) {
        const summary = formatTreatmentSummary(existing.lastTreatment || existing.lastParams);
        const historyText = summary
          ? t('patientHistorySummary').replace('{summary}', summary)
          : t('patientHistoryNone');
        setPatientIdHint(`${t('patientIdLoaded')} · ${historyText}`, false);
        return;
      }
      applyPatientFormData(existing);
      return;
    }
    if (state.editingPatientId && !skipFill) {
      state.editingPatientId = null;
      clearPatientFormFields({ preserveId: true });
    }
    setPatientIdHint(t('patientIdAvailable'), false);
  }

  function schedulePatientIdCheck() {
    if (state.patientIdCheckTimer) clearTimeout(state.patientIdCheckTimer);
    state.patientIdCheckTimer = setTimeout(() => {
      state.patientIdCheckTimer = null;
      checkPatientIdInput();
    }, 350);
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

  function setPatientIdHint(msg, isError = false) {
    const node = document.getElementById('patientIdHint');
    if (!node) return;
    if (!msg) {
      node.hidden = true;
      node.textContent = '';
      node.classList.remove('error');
      node.classList.add('info');
      return;
    }
    node.hidden = false;
    node.textContent = msg;
    node.classList.toggle('error', !!isError);
    node.classList.toggle('info', !isError);
  }

  function applyPatientFormData(patient) {
    if (!patient) return;
    const idInput = document.getElementById('patientId');
    const nameInput = document.getElementById('patientName');
    const phoneInput = document.getElementById('patientPhone');
    const birthInput = document.getElementById('patientBirth');
    if (idInput) idInput.value = patient.id || '';
    if (nameInput) nameInput.value = patient.name || '';
    if (phoneInput) phoneInput.value = patient.phone || '';
    if (birthInput) birthInput.value = patient.birth || '';
    const gender = patient.gender === '女' ? '女' : '男';
    const genderNode = document.querySelector(`input[name="patientGender"][value="${gender}"]`);
    if (genderNode) genderNode.checked = true;
    state.newPatientPhoto = null;
    state.editingPatientId = patient.id || null;
    const summary = formatTreatmentSummary(patient.lastTreatment || patient.lastParams);
    const historyText = summary
      ? t('patientHistorySummary').replace('{summary}', summary)
      : t('patientHistoryNone');
    setPatientIdHint(`${t('patientIdLoaded')} · ${historyText}`, false);
  }

  function clearPatientFormFields({ preserveId = false } = {}) {
    const idInput = document.getElementById('patientId');
    const nameInput = document.getElementById('patientName');
    const phoneInput = document.getElementById('patientPhone');
    const birthInput = document.getElementById('patientBirth');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (birthInput) birthInput.value = '';
    const male = document.querySelector('input[name="patientGender"][value="男"]');
    if (male) male.checked = true;
    if (!preserveId && idInput) idInput.value = computeNextPatientId();
    state.newPatientPhoto = null;
  }

  function resetPatientForm(clearMsg = true) {
    clearPatientFormFields({ preserveId: false });
    state.editingPatientId = null;
    setPatientIdHint(t('patientIdAvailable'), false);
    if (state.patientIdCheckTimer) {
      clearTimeout(state.patientIdCheckTimer);
      state.patientIdCheckTimer = null;
    }
    if (clearMsg) setPatientFormMessage(null);
  }

  const datePickerState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selected: null,
    view: 'calendar',
    targetId: 'patientBirth',
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

  function formatBirthInput(raw) {
    const digits = String(raw || '').replace(/\D/g, '').slice(0, 8);
    if (!digits) return '';
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    const yearRaw = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);
    let year = yearRaw;
    if (!parseDateYMD(`${yearRaw}-${month}-${day}`)) {
      const swappedYear = `${digits[0]}${digits[3]}${digits[2]}${digits[1]}`;
      if (parseDateYMD(`${swappedYear}-${month}-${day}`)) {
        year = swappedYear;
      }
    }
    return `${year}-${month}-${day}`;
  }

  function normalizeDateOnly(date) {
    if (!(date instanceof Date)) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    setupDragScroll(listNode);
    if (titleNode) titleNode.textContent = t('datePickerSelectYear');
    if (backBtn) backBtn.textContent = t('datePickerBack');
    listNode.innerHTML = '';

    const nowYear = new Date().getFullYear();
    const startYear = nowYear - 80;
    const endYear = 2099;
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
        const input = document.getElementById(datePickerState.targetId || 'patientBirth');
        if (input) input.value = dtStr;
        if (String(datePickerState.targetId || '').startsWith('filter')) {
          applyPatientFiltersFromUI();
        }
        closeDatePicker();
      });
      gridNode.appendChild(cell);
    }

    const btnToday = document.getElementById('datePickerToday');
    const btnCancel = document.getElementById('datePickerCancel');
    if (btnToday) btnToday.textContent = t('datePickerToday');
    if (btnCancel) btnCancel.textContent = t('datePickerCancel');
  }

  function openDatePicker(initialValue, targetId = 'patientBirth') {
    const modal = document.getElementById('datePickerModal');
    if (!modal) return;
    const initDate = parseDateYMD(initialValue) || new Date();
    datePickerState.year = initDate.getFullYear();
    datePickerState.month = initDate.getMonth();
    datePickerState.selected = formatDateYMD(initDate);
    datePickerState.view = 'calendar';
    datePickerState.targetId = targetId || 'patientBirth';
    modal.hidden = false;
    renderDatePicker();
  }

  function closeDatePicker() {
    const modal = document.getElementById('datePickerModal');
    if (modal) modal.hidden = true;
  }

  let photoStream = null;

  function updatePatientPhotoPreview() {
    const img = document.getElementById('patientPhotoPreview');
    if (!img) return;
    if (state.newPatientPhoto) {
      img.src = state.newPatientPhoto;
      img.hidden = false;
    } else {
      img.removeAttribute('src');
      img.hidden = true;
    }
  }

  async function openPhotoCaptureModal() {
    const modal = document.getElementById('photoCaptureModal');
    const video = document.getElementById('photoVideo');
    if (!modal || !video) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      showAlert(t('photoCaptureNoCamera'), 3000, 'error');
      return;
    }
    try {
      photoStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      video.srcObject = photoStream;
      await video.play();
      modal.hidden = false;
    } catch (err) {
      console.warn('[PPHC] camera open failed', err);
      showAlert(t('photoCaptureFailed'), 3000, 'error');
    }
  }

  function stopPhotoStream() {
    if (!photoStream) return;
    photoStream.getTracks().forEach((track) => track.stop());
    photoStream = null;
  }

  function closePhotoCaptureModal() {
    const modal = document.getElementById('photoCaptureModal');
    if (modal) modal.hidden = true;
    stopPhotoStream();
  }

  function capturePhoto() {
    const video = document.getElementById('photoVideo');
    const canvas = document.getElementById('photoCanvas');
    if (!video || !canvas) return;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    try {
      state.newPatientPhoto = canvas.toDataURL('image/jpeg', 0.85);
      updatePatientPhotoPreview();
      closePhotoCaptureModal();
    } catch (err) {
      console.warn('[PPHC] capture photo failed', err);
      showAlert(t('photoCaptureFailed'), 3000, 'error');
    }
  }

  function renderPatientList() {
    const listNode = document.getElementById('patientList');
    const emptyNode = document.getElementById('patientListEmpty');
    const pagerNode = document.getElementById('patientListPager');
    const pageLabel = document.getElementById('patientPageLabel');
    const pagePrev = document.getElementById('patientPagePrev');
    const pageNext = document.getElementById('patientPageNext');
    const selectPageBtn = document.getElementById('btnSelectPatientPage');
    if (!listNode) return;
    listNode.innerHTML = '';
    if (selectPageBtn) selectPageBtn.onclick = null;
    const patients = Array.isArray(state.patients) ? state.patients : [];
    const sortedPatients = patients.slice().sort((a, b) => {
      const aTime = a?.createdAt ? Date.parse(a.createdAt) : NaN;
      const bTime = b?.createdAt ? Date.parse(b.createdAt) : NaN;
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
      const aNum = Number(String(a?.id || '').replace(/\D/g, '')) || 0;
      const bNum = Number(String(b?.id || '').replace(/\D/g, '')) || 0;
      if (aNum !== bNum) return aNum - bNum;
      return String(a?.id || '').localeCompare(String(b?.id || ''));
    });
    state.selectedPatientIds = state.selectedPatientIds.filter((id) =>
      patients.some((p) => String(p?.id || '') === id)
    );
    const pageSize = PATIENT_LIST_PAGE_SIZE;
    const pageCount = Math.max(1, Math.ceil(sortedPatients.length / pageSize));
    const fallbackPage = Math.max(0, pageCount - 1);
    const currentPage = clampNumber(state.patientListPage, 0, pageCount - 1, fallbackPage);
    state.patientListPage = currentPage;
    const pageStart = currentPage * pageSize;
    const pageItems = sortedPatients.slice(pageStart, pageStart + pageSize);
    if (pagerNode) pagerNode.hidden = !sortedPatients.length;
    if (pageLabel) {
      const template = t('patientPageLabel');
      pageLabel.textContent = template.includes('{page}')
        ? template.replace('{page}', String(currentPage + 1))
        : String(currentPage + 1);
    }
    if (pagePrev) {
      pagePrev.disabled = currentPage <= 0;
      pagePrev.onclick = () => {
        if (state.patientListPage > 0) {
          state.patientListPage -= 1;
          renderPatientList();
        }
      };
    }
    if (pageNext) {
      pageNext.disabled = currentPage >= pageCount - 1;
      pageNext.onclick = () => {
        if (state.patientListPage < pageCount - 1) {
          state.patientListPage += 1;
          renderPatientList();
        }
      };
    }
    if (selectPageBtn) {
      selectPageBtn.disabled = !pageItems.length;
      selectPageBtn.onclick = () => {
        const ids = pageItems.map((item) => String(item?.id || '')).filter(Boolean);
        state.selectedPatientIds = ids;
        state.selectedPatientId = ids[0] || null;
        renderPatientList();
      };
    }
    if (!sortedPatients.length) {
      if (emptyNode) emptyNode.hidden = false;
      return;
    }
    if (emptyNode) emptyNode.hidden = true;
    const table = document.createElement('div');
    table.className = 'patient-table';

    const headerRow = document.createElement('div');
    headerRow.className = 'patient-row header';
    const headerCells = [
      { key: '', className: 'select' },
      { key: 'patientId', className: 'id' },
      { key: 'patientName', className: 'name' },
      { key: 'patientGender', className: 'gender' },
      { key: 'patientPhone', className: 'phone' },
      { key: 'patientBirth', className: 'birth' },
      { key: 'patientCreatedAt', className: 'created' },
      { key: 'patientTreat', className: 'treat' },
    ];
    headerCells.forEach(({ key, className }) => {
      const cell = document.createElement('div');
      cell.className = `patient-cell ${className}`;
      if (key) cell.textContent = t(key);
      headerRow.appendChild(cell);
    });
    table.appendChild(headerRow);

    pageItems.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'patient-row';
      const pid = String(p.id || '');
      row.classList.toggle('selected', state.selectedPatientIds.includes(pid));
      const selectCell = document.createElement('div');
      selectCell.className = 'patient-cell select';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'patient-select';
      checkbox.checked = state.selectedPatientIds.includes(pid);
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
          if (!state.selectedPatientIds.includes(pid)) {
            state.selectedPatientIds = [...state.selectedPatientIds, pid];
          }
          state.selectedPatientId = pid;
        } else {
          state.selectedPatientIds = state.selectedPatientIds.filter((id) => id !== pid);
          if (state.selectedPatientId === pid) {
            state.selectedPatientId = state.selectedPatientIds[0] || null;
          }
        }
        renderPatientList();
      });
      selectCell.appendChild(checkbox);
      row.appendChild(selectCell);
      const created = p.createdAt ? (p.createdAt.split?.('T')?.[0] || p.createdAt) : '--';
      const values = {
        id: p.id || '--',
        name: p.name || '--',
        gender: p.gender || '--',
        phone: p.phone || '--',
        birth: p.birth || '--',
        created,
      };
      ['id', 'name', 'gender', 'phone', 'birth', 'created'].forEach((col) => {
        const cell = document.createElement('div');
        cell.className = `patient-cell ${col}`;
        cell.textContent = values[col];
        row.appendChild(cell);
      });
      const treatCell = document.createElement('div');
      treatCell.className = 'patient-cell treat';
      const treatBtn = document.createElement('button');
      treatBtn.type = 'button';
      treatBtn.className = 'ghost-btn';
      treatBtn.textContent = t('patientTreat');
      treatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTreatmentForPatient(p);
      });
      treatCell.appendChild(treatBtn);
      row.appendChild(treatCell);
      row.addEventListener('click', (e) => {
        const id = String(p.id || '');
        if (e.ctrlKey) {
          if (state.selectedPatientIds.includes(id)) {
            state.selectedPatientIds = state.selectedPatientIds.filter((x) => x !== id);
          } else {
            state.selectedPatientIds = [...state.selectedPatientIds, id];
          }
        } else {
          state.selectedPatientIds = [id];
        }
        state.selectedPatientId = id;
        renderPatientList();
      });
      table.appendChild(row);
    });

    listNode.appendChild(table);
  }

  function applyPatientFiltersFromUI() {
    const startInput = document.getElementById('filterStartDate');
    const endInput = document.getElementById('filterEndDate');
    const idInput = document.getElementById('filterPatientId');
    const nameInput = document.getElementById('filterPatientName');
    const therapistInput = document.getElementById('filterTherapist');
    const deviceInput = document.getElementById('filterDeviceModel');
    state.patientListPage = 0;
    state.patientFilters = {
      startDate: startInput?.value || '',
      endDate: endInput?.value || '',
      patientId: idInput?.value || '',
      name: nameInput?.value || '',
      therapist: therapistInput?.value || '',
      deviceModel: deviceInput?.value || '',
    };
    renderPatientList();
  }

  function resetPatientFilters() {
    state.patientListPage = 0;
    state.patientFilters = {
      startDate: '',
      endDate: '',
      patientId: '',
      name: '',
      therapist: '',
      deviceModel: '',
    };
    const startInput = document.getElementById('filterStartDate');
    const endInput = document.getElementById('filterEndDate');
    const idInput = document.getElementById('filterPatientId');
    const nameInput = document.getElementById('filterPatientName');
    const therapistInput = document.getElementById('filterTherapist');
    const deviceInput = document.getElementById('filterDeviceModel');
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (therapistInput) therapistInput.value = '';
    if (deviceInput) deviceInput.value = '';
    renderPatientList();
  }

  function getPatientById(id) {
    const key = normalizePatientIdInput(id);
    if (!key) return null;
    return (Array.isArray(state.patients) ? state.patients : []).find(
      (p) => normalizePatientIdInput(p?.id || '') === key
    );
  }

  function formatTreatmentSummary(treatment) {
    if (!treatment) return '';
    const press = Number.isFinite(Number(treatment.pressureMmHg))
      ? `${Number(treatment.pressureMmHg)} mmHg`
      : '--';
    const duration = Number.isFinite(Number(treatment.durationMin))
      ? `${Number(treatment.durationMin)} min`
      : '--';
    const temp = Number.isFinite(Number(treatment.tempC))
      ? `${Number(treatment.tempC).toFixed(1)} ℃`
      : '--';
    const when = treatment.startedAt ? new Date(treatment.startedAt).toLocaleDateString() : '';
    return [press, duration, temp, when].filter(Boolean).join(' · ');
  }

  function updateQuickPatientHistory(patient) {
    const node = document.getElementById('quickPatientHistory');
    if (!node) return;
    if (!patient?.lastTreatment) {
      node.textContent = t('quickPatientHistoryEmpty');
      return;
    }
    node.textContent = `${t('quickPatientHistory')}: ${formatTreatmentSummary(patient.lastTreatment)}`;
  }

  function updateRecommendedPlan(patient) {
    const node = document.getElementById('recommendPlanValue');
    if (!node) return;
    const params = patient?.lastParams || patient?.lastTreatment;
    if (params) {
      const text = formatTreatmentSummary(params);
      node.textContent = text || t('recommendPlanDefault');
      return;
    }
    node.textContent = t('recommendPlanDefault');
  }

  function applyPatientDefaults(patient) {
    if (!patient || state.running) {
      updateRecommendedPlan(patient);
      return;
    }
    const params = patient.lastParams || patient.lastTreatment;
    if (!params) {
      updateRecommendedPlan(null);
      return;
    }
    const duration = Number(params.durationMin);
    const tempC = Number(params.tempC);
    const durationSlider = document.getElementById('treatDuration');
    if (durationSlider && Number.isFinite(duration)) {
      durationSlider.value = String(Math.max(0, Math.min(12, Math.round(duration))));
    }
    state.targets.pressure = FIXED_PRESSURE_MMHG;
    if (Number.isFinite(duration)) state.targets.durationMin = Math.max(0, Math.min(12, duration));
    if (Number.isFinite(tempC)) state.targets.temp = tempC;
    updateModeMeta();
    updateRecommendedPlan(patient);
  }

  function drawPreviewCurve(canvas, snapshot) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const left = Array.isArray(snapshot?.[0]) ? snapshot[0] : [];
    const right = Array.isArray(snapshot?.[2]) ? snapshot[2] : [];
    const maxLen = Math.max(left.length, right.length, 2);
    if (maxLen < 2) return;
    const dataL = left.slice(-maxLen);
    const dataR = right.slice(-maxLen);
    const vals = [...dataL, ...dataR].filter((v) => typeof v === 'number');
    if (!vals.length) return;
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;
    const pad = range * 0.1 || 1;
    const min = minVal - pad;
    const max = maxVal + pad;
    const yFor = (v) => canvas.height * (1 - (v - min) / (max - min));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawLine = (data, color) => {
      if (!data.length) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      data.forEach((val, idx) => {
        const x = (idx / (data.length - 1 || 1)) * canvas.width;
        const y = yFor(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };
    drawLine(dataL, 'rgba(53,209,192,0.9)');
    drawLine(dataR, 'rgba(245,165,36,0.9)');
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
    const searchInput = document.getElementById('quickPatientSearch');
    const queryRaw = searchInput ? searchInput.value : state.quickPatientQuery;
    const query = String(queryRaw || '').trim();
    state.quickPatientQuery = query;
    const queryLower = query.toLowerCase();

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
    const filteredPatients = queryLower
      ? sortedPatients.filter((p) => {
          const hay = [
            p?.id,
            p?.name,
            p?.phone,
            p?.therapist,
            p?.deviceModel,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return hay.includes(queryLower);
        })
      : sortedPatients;
    ensureTreatmentPatientSelected();
    const activeId = String(state.treatmentPatientId || '').trim();
    const activePatient = activeId ? getPatientById(activeId) : null;
    updateQuickPatientHistory(activePatient);
    if (activeId && activeId !== state.lastAppliedPatientId) {
      applyPatientDefaults(activePatient);
      state.lastAppliedPatientId = activeId;
    } else if (!activeId) {
      updateRecommendedPlan(null);
      state.lastAppliedPatientId = null;
    }

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

    if (!filteredPatients.length) {
      const emptyText = queryLower ? t('quickPatientSearchEmpty') : t('quickPatientEmpty');
      listNode.innerHTML = `<div class="empty-tip">${emptyText}</div>`;
      return;
    }

    filteredPatients.forEach((p) => {
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


  function openTreatmentForPatient(patient) {
    if (!patient) return;
    const id = String(patient.id || '').trim();
    state.activePatient = patient;
    state.selectedPatientId = id || null;
    state.selectedPatientIds = id ? [id] : [];
    state.treatmentPatientId = id || null;
    showView('quick');
  }

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

  function applyReportTemplate(template, opts = {}) {
    const next = template === 'compact' ? 'compact' : 'standard';
    state.reportTemplate = next;
    const hideExtras = next === 'compact';
    const tipsSection = document.getElementById('reportSectionTips');
    const disclaimerSection = document.getElementById('reportSectionDisclaimer');
    if (tipsSection) tipsSection.hidden = hideExtras;
    if (disclaimerSection) disclaimerSection.hidden = hideExtras;
    const select = document.getElementById('reportTemplateSelect');
    if (select) {
      select.value = next;
      updateCustomSelectDisplay(select);
    }
    if (opts.syncChecks) {
      const includePatient = document.getElementById('exportIncludePatient');
      const includeTreatment = document.getElementById('exportIncludeTreatment');
      const includeTips = document.getElementById('exportIncludeTips');
      const includeDisclaimer = document.getElementById('exportIncludeDisclaimer');
      if (includePatient) includePatient.checked = true;
      if (includeTreatment) includeTreatment.checked = true;
      if (includeTips) includeTips.checked = !hideExtras;
      if (includeDisclaimer) includeDisclaimer.checked = !hideExtras;
    }
  }

  function getCurrentTreatmentInfo() {
    const pressureMmHg =
      state.lastTreatment?.pressureMmHg ?? state.targets.pressure ?? FIXED_PRESSURE_MMHG;
    const durationMin =
      state.lastTreatment?.durationMin ??
      Number(document.getElementById('treatDuration')?.value ?? 0);
    const modeVal = state.lastTreatment?.mode ?? state.mode ?? 1;
    const sides = state.lastTreatment?.sides || state.activeSides || [];
    const tempC =
      state.lastTreatment?.tempC ??
      (Number.isFinite(Number(state.targets.temp)) ? Number(state.targets.temp) : TEMP_FIXED_C);
    const sidesText = sides.length
      ? sides.map((s) => (s === 'left' ? t('leftEye') : t('rightEye'))).join(' / ')
      : '--';
    const startedAt = state.lastTreatment?.startedAt
      ? new Date(state.lastTreatment.startedAt).toLocaleString()
      : '--';
    return {
      pressureMmHg,
      durationMin,
      modeVal,
      sidesText,
      tempC,
      startedAt,
    };
  }

  function collectReportData(options = {}) {
    const patient = state.activePatient || {};
    const info = getCurrentTreatmentInfo();
    const data = {
      title: `${t('homeTitle')} ${t('reportSuffix')}`,
      generatedAt: new Date().toLocaleString(),
      patientTitle: t('reportPatientInfoTitle'),
      treatmentTitle: t('reportTreatmentInfoTitle'),
      tipsTitle: t('reportTipsTitle'),
      disclaimerTitle: t('reportDisclaimerTitle'),
      patientInfo: [],
      treatmentInfo: [],
      tips: [],
      disclaimer: '',
    };
    if (options.includePatient) {
      data.patientInfo = [
        { label: t('patientId'), value: patient?.id || '--' },
        { label: t('patientName'), value: patient?.name || '--' },
        { label: t('patientGender'), value: patient?.gender || '--' },
        { label: t('patientPhone'), value: patient?.phone || '--' },
        { label: t('patientBirth'), value: patient?.birth || '--' },
        { label: t('patientCreatedAt'), value: patient?.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '--' },
        { label: t('patientNotes'), value: patient?.notes || '--' },
      ];
    }
    if (options.includeTreatment) {
      data.treatmentInfo = [
        { label: t('reportPressureLabel'), value: info.pressureMmHg ? `${info.pressureMmHg} mmHg` : '--' },
        { label: t('reportDurationLabel'), value: info.durationMin ? `${info.durationMin} min` : '--' },
        { label: t('reportTempLabel'), value: `${info.tempC} ℃` },
        { label: t('reportModeLabel'), value: String(info.modeVal) },
        { label: t('reportSidesLabel'), value: info.sidesText },
        { label: t('reportStartTimeLabel'), value: info.startedAt },
      ];
    }
    if (options.includeTips) {
      data.tips = REPORT_TIPS[currentLang] || REPORT_TIPS.zh;
    }
    if (options.includeDisclaimer) {
      data.disclaimer = REPORT_DISCLAIMER[currentLang] || REPORT_DISCLAIMER.zh;
    }
    return data;
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
      const info = getCurrentTreatmentInfo();
      appendReportField(
        treatGrid,
        t('reportPressureLabel'),
        info.pressureMmHg ? `${info.pressureMmHg} mmHg` : '--'
      );
      appendReportField(
        treatGrid,
        t('reportDurationLabel'),
        info.durationMin ? `${info.durationMin} min` : '--'
      );
      appendReportField(treatGrid, t('reportTempLabel'), `${info.tempC} ℃`);
      appendReportField(treatGrid, t('reportModeLabel'), String(info.modeVal));
      appendReportField(treatGrid, t('reportSidesLabel'), info.sidesText);
      appendReportField(treatGrid, t('reportStartTimeLabel'), info.startedAt);
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
    if (exportBtn) exportBtn.textContent = t('exportReport');
    const printBtn = document.getElementById('btnPrintReport');
    if (printBtn) printBtn.textContent = t('printReport');
    const formatLabel = document.getElementById('reportExportFormatLabel');
    if (formatLabel) formatLabel.textContent = t('exportFormatLabel');
    const templateLabel = document.getElementById('reportTemplateLabel');
    if (templateLabel) templateLabel.textContent = t('reportTemplateLabel');
    const templateSelect = document.getElementById('reportTemplateSelect');
    if (templateSelect) {
      const opts = templateSelect.querySelectorAll('option');
      if (opts[0]) opts[0].textContent = t('reportTemplateStandard');
      if (opts[1]) opts[1].textContent = t('reportTemplateCompact');
    }
    const includePatient = document.getElementById('exportIncludePatientLabel');
    if (includePatient) includePatient.textContent = t('exportIncludePatient');
    const includeTreatment = document.getElementById('exportIncludeTreatmentLabel');
    if (includeTreatment) includeTreatment.textContent = t('exportIncludeTreatment');
    const includeTips = document.getElementById('exportIncludeTipsLabel');
    if (includeTips) includeTips.textContent = t('exportIncludeTips');
    const includeDisclaimer = document.getElementById('exportIncludeDisclaimerLabel');
    if (includeDisclaimer) includeDisclaimer.textContent = t('exportIncludeDisclaimer');
    applyReportTemplate('standard', { syncChecks: false });
  }

  async function handleExportReportPdf() {
    const format = document.getElementById('reportExportFormat')?.value || 'pdf';
    const includePatientNode = document.getElementById('exportIncludePatient');
    const includeTreatmentNode = document.getElementById('exportIncludeTreatment');
    const includeTipsNode = document.getElementById('exportIncludeTips');
    const includeDisclaimerNode = document.getElementById('exportIncludeDisclaimer');
    const includePatient = includePatientNode ? includePatientNode.checked : true;
    const includeTreatment = includeTreatmentNode ? includeTreatmentNode.checked : true;
    const includeTips = includeTipsNode ? includeTipsNode.checked : true;
    const includeDisclaimer = includeDisclaimerNode ? includeDisclaimerNode.checked : true;
    if (format === 'pdf') {
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
      return;
    }
    showAlert(t('exportingReport'), 2000, 'info');
    try {
      const data = collectReportData({
        includePatient,
        includeTreatment,
        includeTips,
        includeDisclaimer,
      });
      const res = api?.exportReportData
        ? await api.exportReportData({
            format,
            patientId: state.activePatient?.id || '',
            data,
          })
        : null;
      if (res?.success) {
        const filePath = String(res.filePath || '');
        const base = filePath.split(/[\\/]/).filter(Boolean).pop() || '';
        const hint = base ? `reports/${base}` : 'reports/';
        showAlert(`${t('exportReportSuccess')}: ${hint}`, 6000, 'success');
      } else {
        const reason = res?.failureReason ? `: ${res.failureReason}` : '';
        showAlert(`${t('exportReportFailed')}${reason}`, 4500, 'error');
      }
    } catch (err) {
      console.warn('[PPHC] export report failed', err);
      showAlert(t('exportReportFailed'), 4500, 'error');
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

  function setPatientDeleteMessage(msg, isError = false) {
    const node = document.getElementById('patientDeleteMessage');
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

  function openPatientDeleteModal(ids) {
    const modal = document.getElementById('patientDeleteModal');
    if (!modal) return;
    state.pendingPatientDeleteIds = Array.isArray(ids) ? ids : [];
    const text = document.getElementById('patientDeleteText');
    if (text) {
      text.textContent = t('patientDeleteText');
    }
    setPatientDeleteMessage(null);
    modal.hidden = false;
  }

  function closePatientDeleteModal() {
    const modal = document.getElementById('patientDeleteModal');
    if (modal) modal.hidden = true;
    state.pendingPatientDeleteIds = [];
    hideKeyboard();
  }

  async function confirmPatientDelete() {
    const ids = Array.isArray(state.pendingPatientDeleteIds) ? state.pendingPatientDeleteIds : [];
    if (!ids.length) {
      closePatientDeleteModal();
      return;
    }
    try {
      const removedPatients = (state.patients || []).filter((p) =>
        ids.includes(String(p?.id || ''))
      );
      for (const id of ids) {
        await api?.removePatient?.(id);
      }
      state.selectedPatientIds = [];
      state.selectedPatientId = null;
      await ensurePatientsLoaded();
      state.patients = state.patients.filter((p) => !ids.includes(String(p?.id || '')));
      if (ids.includes(String(state.treatmentPatientId || ''))) state.treatmentPatientId = null;
      renderPatientList();
      renderQuickPatientPicker();
      recordOperation('patient-delete', `-${ids.length}`);
      showAlert(t('patientDeleted'), 3500, 'success');
      closePatientDeleteModal();
    } catch (err) {
      console.warn('[PPHC] delete patient failed', err);
      setPatientDeleteMessage(t('patientDeleteFailed'), true);
    }
  }

  async function handleBatchExportReports() {
    const ids = state.selectedPatientIds.length
      ? state.selectedPatientIds.slice()
      : [String(state.selectedPatientId || '').trim()].filter(Boolean);
    if (!ids.length) {
      showAlert(t('batchExportNeedSelect'), 3500, 'error');
      return;
    }
    const format = document.getElementById('reportExportFormat')?.value || 'pdf';
    const includePatientNode = document.getElementById('exportIncludePatient');
    const includeTreatmentNode = document.getElementById('exportIncludeTreatment');
    const includeTipsNode = document.getElementById('exportIncludeTips');
    const includeDisclaimerNode = document.getElementById('exportIncludeDisclaimer');
    const includePatient = includePatientNode ? includePatientNode.checked : true;
    const includeTreatment = includeTreatmentNode ? includeTreatmentNode.checked : true;
    const includeTips = includeTipsNode ? includeTipsNode.checked : true;
    const includeDisclaimer = includeDisclaimerNode ? includeDisclaimerNode.checked : true;
    const prevView = state.currentView;
    const prevPatient = state.activePatient;
    showAlert(t('batchExportStart'), 2000, 'info');
    try {
      for (const id of ids) {
        const patient = getPatientById(id);
        if (!patient) continue;
        state.activePatient = patient;
        showView('report');
        renderReport();
        if (format === 'pdf') {
          await api?.exportReportPdf?.({ patientId: patient.id || '' });
        } else {
          const data = collectReportData({
            includePatient,
            includeTreatment,
            includeTips,
            includeDisclaimer,
          });
          await api?.exportReportData?.({ format, patientId: patient.id || '', data });
        }
      }
      state.activePatient = prevPatient;
      showView(prevView || 'patientList');
      showAlert(t('batchExportDone'), 4000, 'success');
    } catch (err) {
      console.warn('[PPHC] batch export failed', err);
      state.activePatient = prevPatient;
      showView(prevView || 'patientList');
      showAlert(t('batchExportFailed'), 4000, 'error');
    }
  }

  async function handleDeleteSelectedPatient() {
    const ids = state.selectedPatientIds.length
      ? state.selectedPatientIds.slice()
      : [String(state.selectedPatientId || '').trim()].filter(Boolean);
    if (!ids.length) {
      showAlert(t('patientDeleteNeedSelect'), 3500, 'error');
      return;
    }
    openPatientDeleteModal(ids);
  }

  async function handleClearPatients() {
    try {
      const res = api?.clearPatients ? await api.clearPatients() : null;
      if (res?.success) {
        state.selectedPatientId = null;
        state.selectedPatientIds = [];
        state.treatmentPatientId = null;
        state.patients = [];
        state.patientsLoaded = true;
        renderPatientList();
        renderQuickPatientPicker();
        setUndoSnapshot(null);
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
    const ledBtn = document.getElementById('btnEngineerTestLed');
    if (ledBtn) ledBtn.textContent = t('engineerTestLed');

    const mmHg = Number.isFinite(Number(state.targets.pressure))
      ? Number(state.targets.pressure)
      : FIXED_PRESSURE_MMHG;
    const min =
      Number.isFinite(Number(state.targets.durationMin))
        ? Number(state.targets.durationMin)
        : Number(document.getElementById('treatDuration')?.value ?? 0);
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

    updateRangeFill(p);
    updateRangeFill(d);
    updateRangeFill(tSlider);
    updateRangeFill(b);
    updateRangeFill(v);
    bindRangeFill(p);
    bindRangeFill(d);
    bindRangeFill(tSlider);
    bindRangeFill(b);
    bindRangeFill(v);
  }

  function bindEngineerControls() {
    const p = document.getElementById('engineerPressure');
    if (p) {
      bindRangeFill(p);
      p.addEventListener('input', () => {
        const mmHg = Math.max(0, Math.min(400, Math.round(Number(p.value || 0))));
        const pv = document.getElementById('engineerPressureValue');
        if (pv) pv.textContent = `${mmHg} mmHg`;
        state.targets.pressure = mmHg;
      });
    }
    const d = document.getElementById('engineerDuration');
    if (d) {
      bindRangeFill(d);
      d.addEventListener('input', () => {
        const min = Math.max(1, Math.min(30, Math.round(Number(d.value || 10))));
        const dv = document.getElementById('engineerDurationValue');
        if (dv) dv.textContent = `${min} min`;
        state.targets.durationMin = min;
        const quickD = document.getElementById('treatDuration');
        if (quickD) {
          quickD.value = String(Math.max(0, Math.min(12, min)));
          updateModeMeta();
        }
      });
    }
    const tSlider = document.getElementById('engineerTemp');
    if (tSlider) {
      bindRangeFill(tSlider);
      tSlider.addEventListener('input', () => {
        const temp = Math.max(35, Math.min(45, Number(tSlider.value || TEMP_FIXED_C)));
        state.targets.temp = Number(temp.toFixed(1));
        const tv = document.getElementById('engineerTempValue');
        if (tv) tv.textContent = `${state.targets.temp.toFixed(1)} ℃`;
      });
    }
    const b = document.getElementById('engineerBrightness');
    if (b) {
      bindRangeFill(b);
      b.addEventListener('input', () => {
        requestBrightnessApply(b.value);
        const bv = document.getElementById('engineerBrightnessValue');
        if (bv) bv.textContent = `${clampBrightness(b.value)}%`;
      });
    }
    const v = document.getElementById('engineerVolume');
    if (v) {
      bindRangeFill(v);
      v.addEventListener('input', () => {
        requestVolumeApply(v.value);
        const vv = document.getElementById('engineerVolumeValue');
        if (vv) vv.textContent = `${clampVolume(v.value)}%`;
      });
    }
    document.getElementById('btnEngineerTestSound')?.addEventListener('click', () => {
      api?.playPromptSound?.('start').catch?.(() => {});
    });
    document.getElementById('btnEngineerTestLed')?.addEventListener('click', () => {
      api?.testLed?.().catch?.(() => {});
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
    const idInput = document.getElementById('patientId');
    const nameInput = document.getElementById('patientName');
    const phoneInput = document.getElementById('patientPhone');
    const birthInput = document.getElementById('patientBirth');
    const genderInput = document.querySelector('input[name="patientGender"]:checked');
    await ensurePatientsLoaded();
    let patientId = normalizePatientIdInput(idInput?.value || '');
    if (!patientId) {
      patientId = computeNextPatientId();
      if (idInput) idInput.value = patientId;
    }
    const name = nameInput?.value?.trim() || '';
    if (!name) {
      setPatientFormMessage(t('patientNameRequired'), true);
      return;
    }
    if (!genderInput) {
      setPatientFormMessage(t('patientGenderRequired'), true);
      return;
    }
    const birthText = birthInput?.value?.trim() || '';
    if (!birthText) {
      setPatientFormMessage(t('patientBirthRequired'), true);
      return;
    }
    if (!parseDateYMD(birthText)) {
      setPatientFormMessage(t('patientBirthInvalid'), true);
      return;
    }
    setPatientFormMessage(null);
    try {
      const existing = getPatientById(patientId);
      const isEditing =
        state.editingPatientId && normalizePatientIdInput(state.editingPatientId) === patientId;
      if (existing && !isEditing) {
        setPatientFormMessage(t('patientIdDuplicate'), true);
        return;
      }
      const status = existing?.status || 'active';
      const basePayload = {
        name,
        phone: phoneInput?.value?.trim() || '',
        status,
        birth: birthText,
        gender: genderInput?.value || '男',
      };
      if (isEditing && existing) {
        const patch = { ...basePayload };
        const updated = api?.updatePatient
          ? await api.updatePatient({ id: existing.id, patch })
          : { id: existing.id, ...patch };
        if (updated && updated.id) {
          state.patients = state.patients.map((p) =>
            String(p?.id || '') === String(updated.id) ? { ...p, ...updated } : p
          );
          if (state.activePatient && String(state.activePatient.id || '') === String(updated.id)) {
            state.activePatient = { ...state.activePatient, ...updated };
          }
          renderPatientList();
          renderQuickPatientPicker();
          resetPatientForm();
          setPatientFormMessage(t('patientUpdated'));
          showView('patientList');
        } else {
          setPatientFormMessage(t('patientSaveFailed'), true);
        }
        return;
      }
      const payload = {
        id: patientId,
        ...basePayload,
      };
      const saved = api?.addPatient
        ? await api.addPatient(payload)
        : { ...payload, id: patientId, createdAt: new Date().toISOString() };
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

  const getPressureTarget = () => FIXED_PRESSURE_MMHG;

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


  function clearKeyboardShift() {
    document.body.classList.remove('keyboard-shift');
    document.body.style.removeProperty('--keyboard-shift');
  }

  function getTranslateY(node) {
    if (!node) return 0;
    const transform = getComputedStyle(node).transform;
    if (!transform || transform === 'none') return 0;
    const match = transform.match(/^matrix(3d)?\((.+)\)$/);
    if (!match) return 0;
    const values = match[2].split(',').map((v) => parseFloat(v.trim()));
    if (match[1] === '3d') return values[13] || 0;
    return values[5] || 0;
  }

  function updateKeyboardShiftForTarget(target) {
    if (!document.body.classList.contains('view-newPatient')) {
      clearKeyboardShift();
      return;
    }
    const host = getKeyboardHost(keyboardState.zone);
    const osk = host ? document.getElementById(host.oskId) : null;
    if (!osk || osk.classList.contains('osk-hidden') || !target) {
      clearKeyboardShift();
      return;
    }
    if (!document.body.contains(target)) {
      clearKeyboardShift();
      return;
    }
    const targetRect = target.getBoundingClientRect();
    const oskRect = osk.getBoundingClientRect();
    if (!oskRect.height) {
      clearKeyboardShift();
      return;
    }
    const keyboardTop = oskRect.top;
    const margin = 24;
    const currentShift =
      parseFloat(getComputedStyle(document.body).getPropertyValue('--keyboard-shift')) || 0;
    const formNode = target.closest('.patient-form') || document.querySelector('.patient-form');
    const actualShift = Math.max(0, -getTranslateY(formNode));
    const effectiveBottom = targetRect.bottom + actualShift;
    const overlap = effectiveBottom - (keyboardTop - margin);
    if (overlap > 0) {
      const shift = Math.ceil(overlap);
      const nextShift = Math.max(currentShift, shift);
      document.body.style.setProperty('--keyboard-shift', `${nextShift}px`);
      document.body.classList.add('keyboard-shift');
      return;
    }
    if (document.body.classList.contains('keyboard-open') && currentShift > 0) return;
    clearKeyboardShift();
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
    clearKeyboardShift();
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
    requestAnimationFrame(() => updateKeyboardShiftForTarget(keyboardState.target));
    setTimeout(() => updateKeyboardShiftForTarget(keyboardState.target), 120);
  }

  function handleKeyboardConfirm(target) {
    const loginOverlay = document.getElementById('loginOverlay');
    const loginActive =
      loginOverlay && loginOverlay.classList.contains('active') && !loginOverlay.classList.contains('hidden');
    if (loginActive) {
      const addModal = document.getElementById('loginAddUserModal');
      const resetModal = document.getElementById('loginResetModal');
      if (addModal && !addModal.hidden) {
        hideKeyboard();
        return;
      }
      if (resetModal && !resetModal.hidden) {
        hideKeyboard();
        return;
      }
      attemptLogin();
      return;
    }
    const accountRemoveModal = document.getElementById('accountRemoveModal');
    if (accountRemoveModal && !accountRemoveModal.hidden) {
      confirmAccountRemove();
      return;
    }
    const patientDeleteModal = document.getElementById('patientDeleteModal');
    if (patientDeleteModal && !patientDeleteModal.hidden) {
      confirmPatientDelete();
      return;
    }
    if (target && typeof target.blur === 'function') target.blur();
    hideKeyboard();
  }

  function handleKeyboardAction(action) {
    const target = getKeyboardTarget();
    if (!target) return;
    const actionKey = action?.toLowerCase?.() || action;
    const isSpaceKey = actionKey === 'space' || actionKey === '空格';
    const isEnterKey = actionKey === 'enter' || actionKey === '确认' || actionKey === '回车';
    const isBackspaceKey =
      actionKey === 'backspace' || actionKey === '退格' || actionKey === '←';

    if (keyboardState.lang === 'zh') {
      if (isEnterKey) {
        const cand = keyboardState.candidates?.[0] || keyboardState.composing;
        if (cand) commitCandidate(cand);
        handleKeyboardConfirm(target);
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
        handleKeyboardConfirm(target);
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
              e.stopPropagation();
              startBackspaceRepeat();
            });
            btn.addEventListener('pointerup', (e) => {
              e.stopPropagation();
              stopBackspaceRepeat();
            });
            btn.addEventListener('pointerleave', (e) => {
              e.stopPropagation();
              stopBackspaceRepeat();
            });
          } else {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
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
    if (next === 'zh' && !PINYIN_INDEX && !PINYIN_LOAD_PROMISE) {
      schedulePinyinLoad();
    }
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

  function schedulePinyinLoad() {
    if (PINYIN_LOAD_PROMISE || PINYIN_INDEX) return;
    const load = () => loadPinyinIndex();
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(load, { timeout: 1000 });
    } else {
      setTimeout(load, 200);
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
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        commitCandidate(cand);
      });
      list.appendChild(btn);
    });
    if (slice.length < pageSize) {
      const fill = pageSize - slice.length;
      for (let i = 0; i < fill; i += 1) {
        const placeholder = document.createElement('button');
        placeholder.type = 'button';
        placeholder.className = 'ime-candidate placeholder';
        placeholder.textContent = '00.00';
        placeholder.disabled = true;
        placeholder.tabIndex = -1;
        placeholder.setAttribute('aria-hidden', 'true');
        list.appendChild(placeholder);
      }
    }

    if (pageCount > 1) {
      const pager = document.createElement('div');
      pager.className = 'ime-pager';
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'ime-pager-btn';
      prev.textContent = '上一页';
      prev.disabled = keyboardState.candidatePage === 0;
      prev.addEventListener('click', (e) => {
        e.stopPropagation();
        changeCandidatePage(-1);
      });
      const info = document.createElement('div');
      info.className = 'ime-pager-info';
      info.textContent = `${keyboardState.candidatePage + 1} / ${pageCount}`;
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'ime-pager-btn';
      next.textContent = '下一页';
      next.disabled = keyboardState.candidatePage >= pageCount - 1;
      next.addEventListener('click', (e) => {
        e.stopPropagation();
        changeCandidatePage(1);
      });
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
    if (key === 'enter' || key === '确认' || key === '回车') {
      handleKeyboardAction('enter');
      return;
    }
    if (keyboardState.lang === 'zh') {
      handleZhKey(label);
    } else {
      handleEnKey(label);
    }
  }

  function showLoginToast(message, kind = 'success') {
    const toast = document.getElementById('loginToast');
    if (!toast) return;
    toast.classList.remove('success', 'error');
    toast.classList.add(kind);
    const icon = kind === 'success' ? '✅' : '⚠';
    toast.textContent = `${icon} ${message}`;
    toast.hidden = false;
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.hidden = true;
    }, LOGIN_TOAST_DURATION);
  }

  function isValidUsername(username) {
    return USERNAME_RE.test(String(username || ''));
  }

  function setLoginError(msg) {
    const node = document.getElementById('loginError');
    const textNode = document.getElementById('loginErrorText');
    if (!node) return;
    if (!msg) {
      node.hidden = true;
      return;
    }
    if (textNode) textNode.textContent = msg;
    else node.textContent = msg;
    node.hidden = false;
  }

  function setLoginFormDisabled(disabled) {
    ['loginUser', 'loginPass', 'loginSubmit'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !!disabled;
    });
  }

  async function attemptLogin() {
    const userRaw = document.getElementById('loginUser')?.value ?? '';
    const pass = document.getElementById('loginPass')?.value ?? '';
    const user = userRaw.trim();
    if (!user) {
      setLoginError(t('usernameRequired'));
      return false;
    }
    if (!pass) {
      setLoginError(t('passwordRequired'));
      return false;
    }
    try {
      const res = api?.login
        ? await api.login(user, pass)
        : { ok: user === LOGIN_CREDENTIALS.username && pass === LOGIN_CREDENTIALS.password, role: 'admin', username: user };
      if (res && res.ok) {
        setLoginError(null);
        setLoginFormDisabled(true);
        showLoginToast(t('loginSuccess').replace('{user}', res.username || user), 'success');
        if (state.loginPendingTimer) clearTimeout(state.loginPendingTimer);
        state.loginPendingTimer = setTimeout(() => {
          state.loginPendingTimer = null;
          setLoginFormDisabled(false);
          completeLogin({ username: res.username || user, role: res.role || 'user' });
        }, LOGIN_SUCCESS_DELAY);
        return true;
      }
    } catch (err) {
      console.warn('[PPHC] login failed', err);
    }
    setLoginError(t('loginFailed'));
    showLoginToast(t('loginFailed'), 'error');
    return false;
  }

  function setLoginAddUserMessage(msg, isError = false) {
    const node = document.getElementById('loginAddUserMessage');
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

  function setLoginResetMessage(msg, isError = false) {
    const node = document.getElementById('loginResetMessage');
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

  function openLoginAddUserModal() {
    const modal = document.getElementById('loginAddUserModal');
    if (!modal) return;
    setLoginAddUserMessage(null);
    ['loginAddUsername', 'loginAddPassword', 'loginAddPassword2'].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.value = '';
    });
    modal.hidden = false;
  }

  function closeLoginAddUserModal() {
    const modal = document.getElementById('loginAddUserModal');
    if (modal) modal.hidden = true;
    hideKeyboard();
  }

  async function handleLoginAddUserSubmit() {
    setLoginAddUserMessage(null);
    const username = document.getElementById('loginAddUsername')?.value?.trim() || '';
    const password = document.getElementById('loginAddPassword')?.value || '';
    const password2 = document.getElementById('loginAddPassword2')?.value || '';
    const role = document.getElementById('loginAddRole')?.value || 'operator';
    const safeRole = role === 'admin' ? 'admin' : 'operator';
    if (!isValidUsername(username)) {
      setLoginAddUserMessage(t('usernameFormatHint'), true);
      return;
    }
    if (!password) {
      setLoginAddUserMessage(t('passwordRequired'), true);
      return;
    }
    if (password !== password2) {
      setLoginAddUserMessage(t('accountsPasswordMismatch'), true);
      return;
    }
    try {
      await api?.addAccount?.({ username, password, role: safeRole });
      setLoginAddUserMessage(t('loginAddSuccess'), false);
      showLoginToast(t('loginAddSuccess'), 'success');
      hideKeyboard();
      setTimeout(closeLoginAddUserModal, 800);
    } catch (err) {
      console.warn('[PPHC] add user failed', err);
      const msg = String(err?.message || err || '');
      if (msg.includes('exists')) {
        setLoginAddUserMessage(t('usernameExists'), true);
        return;
      }
      if (msg.includes('unauthorized')) {
        setLoginAddUserMessage(t('adminOnly'), true);
        return;
      }
      setLoginAddUserMessage(t('loginAddFailed'), true);
    }
  }

  function openLoginResetModal() {
    const modal = document.getElementById('loginResetModal');
    if (!modal) return;
    setLoginResetMessage(null);
    ['resetUsername', 'resetPassword', 'resetPassword2'].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.value = '';
    });
    modal.hidden = false;
  }

  function closeLoginResetModal() {
    const modal = document.getElementById('loginResetModal');
    if (modal) modal.hidden = true;
    hideKeyboard();
  }

  async function handleLoginResetSubmit() {
    setLoginResetMessage(null);
    const username = document.getElementById('resetUsername')?.value?.trim() || '';
    const password = document.getElementById('resetPassword')?.value || '';
    const password2 = document.getElementById('resetPassword2')?.value || '';
    if (!username) {
      setLoginResetMessage(t('usernameRequired'), true);
      return;
    }
    if (!password) {
      setLoginResetMessage(t('passwordRequired'), true);
      return;
    }
    if (password !== password2) {
      setLoginResetMessage(t('accountsPasswordMismatch'), true);
      return;
    }
    try {
      await api?.resetAccountPassword?.({
        username,
        newPassword: password,
      });
      setLoginResetMessage(t('loginResetSuccess'), false);
      showLoginToast(t('loginResetSuccess'), 'success');
      hideKeyboard();
      setTimeout(closeLoginResetModal, 800);
    } catch (err) {
      console.warn('[PPHC] reset password failed', err);
      const msg = String(err?.message || err || '');
      if (msg.includes('not found')) {
        setLoginResetMessage(t('usernameNotFound'), true);
        return;
      }
      if (msg.includes('unauthorized')) {
        setLoginResetMessage(t('adminOnly'), true);
        return;
      }
      setLoginResetMessage(t('loginResetFailed'), true);
    }
  }

  function setKeyboardTarget(input) {
    const prevTarget = keyboardState.target;
    const prevZone = keyboardState.zone;
    keyboardState.target = input || null;
    const zone = input?.dataset?.oskZone || 'default';
    keyboardState.zone = KEYBOARD_HOSTS[zone] ? zone : 'default';
    if (input) {
      focusEnd(input);
      if (keyboardState.visible && prevTarget === input && prevZone === keyboardState.zone) {
        return;
      }
      showKeyboard();
      renderImeCandidates();
      requestAnimationFrame(() => updateKeyboardShiftForTarget(input));
    }
  }

  function getRoleLabel(role) {
    if (role === 'admin') return t('roleAdmin');
    if (role === 'operator') return t('roleOperator');
    return t('roleUser');
  }

  function updateUserBadge() {
    const badge = document.getElementById('userBadge');
    if (!badge) return;
    if (!state.loggedIn) {
      badge.hidden = true;
      return;
    }
    const username = state.user?.username || '--';
    const avatar = document.getElementById('userAvatar');
    const nameNode = document.getElementById('userName');
    const roleNode = document.getElementById('userRole');
    if (avatar) avatar.textContent = username ? username.slice(0, 1).toUpperCase() : '--';
    if (nameNode) nameNode.textContent = username;
    if (roleNode) roleNode.textContent = getRoleLabel(state.user?.role || 'user');
    badge.hidden = false;
  }

  function applyRoleUI() {
    const role = state.user?.role || 'user';
    document.body.dataset.role = role;

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
      bottomNav.querySelectorAll('.nav-item').forEach((btn) => {
        const view = btn.dataset.view;
        btn.hidden = !view || !canAccessView(view);
      });
    }

    updateBottomNav();
  }

  function completeLogin(info = {}) {
    if (state.loggedIn) return;
    state.loggedIn = true;
    state.user = {
      username: String(info.username || ''),
      role: String(info.role || 'user') || 'user',
    };
    applyRoleUI();
    updateUserBadge();
    document.body.classList.remove('login-locked');
    document.body.classList.remove('view-login');
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.classList.add('hidden');
    }
    keyboardState.target = null;
    hideKeyboard();
    showView(state.user.role === 'engineer' ? 'engineer' : 'home');
    scheduleAutoConnect(0);
    ensureTelemetryLoop();
    startHeroClock();
    updateTelemetry();
    startAutoSaveTimer();
    checkAutoSaveRestore();
    updateBottomNav();
    showAlert(t('loginSuccess').replace('{user}', state.user.username || '--'), LOGIN_TOAST_DURATION, 'success');
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
    setKeyboardLang('en');
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
    document.getElementById('loginAddUser')?.addEventListener('click', openLoginAddUserModal);
    document.getElementById('loginResetLink')?.addEventListener('click', openLoginResetModal);
    document.getElementById('loginAddUserCancel')?.addEventListener('click', closeLoginAddUserModal);
    document.getElementById('loginAddUserSubmit')?.addEventListener('click', handleLoginAddUserSubmit);
    document.getElementById('loginResetCancel')?.addEventListener('click', closeLoginResetModal);
    document.getElementById('loginResetSubmit')?.addEventListener('click', handleLoginResetSubmit);
    document.getElementById('loginAddUserModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'loginAddUserModal') closeLoginAddUserModal();
    });
    document.getElementById('loginResetModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'loginResetModal') closeLoginResetModal();
    });
  }

  function showLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;
    state.loggedIn = false;
    state.user = { username: '', role: 'user' };
    setLoginFormDisabled(false);
    updateUserBadge();
    document.body.classList.add('login-locked');
    document.body.classList.add('view-login');
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    const userInput = document.getElementById('loginUser');
    const passInput = document.getElementById('loginPass');
    if (userInput) userInput.value = LOGIN_CREDENTIALS.username;
    if (passInput) passInput.value = '';
    setLoginError(null);
    setKeyboardLang('en');
    hideKeyboard();
    showView('home');
    stopAutoSaveTimer();
    setUndoSnapshot(null);
    closeAutoSaveRestoreModal();
    updateBottomNav();
  }

  function hideLoginOverlay() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
    document.body.classList.remove('login-locked');
    document.body.classList.remove('view-login');
    hideKeyboard();
  }

  let oskInputsBound = false;

  function isOskEligibleInput(node) {
    if (!node || !(node instanceof HTMLElement)) return false;
    if (!node.matches('input, textarea')) return false;
    if (!node.matches('.osk-input, [data-osk-target]')) return false;
    if (node.hasAttribute('readonly') || node.disabled) return false;
    if (node.classList.contains('date-input')) return false;
    return true;
  }

  function bindOskInputs() {
    if (oskInputsBound) return;
    oskInputsBound = true;
    document.addEventListener(
      'pointerdown',
      (e) => {
        const rawTarget = e.target;
        const target = rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement;
        if (!target) return;
        if (target.closest('.osk')) return;
        const row = target.closest('.form-row');
        if (!row) return;
        const candidates = Array.from(row.querySelectorAll('input, textarea'));
        const rowInput = candidates.find((item) => isOskEligibleInput(item));
        if (rowInput) setKeyboardTarget(rowInput);
      },
      { capture: true }
    );
    document.addEventListener('focusin', (e) => {
      const target = e.target;
      if (!isOskEligibleInput(target)) return;
      setKeyboardTarget(target);
    });
    document.addEventListener('click', (e) => {
      const rawTarget = e.target;
      const target = rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement;
      if (!target) return;
      if (target.closest('.osk')) return;
      const label = target.closest('label[for]');
      if (label) {
        const labelFor = label.getAttribute('for');
        const labeledInput = labelFor ? document.getElementById(labelFor) : null;
        if (isOskEligibleInput(labeledInput)) {
          setKeyboardTarget(labeledInput);
          return;
        }
      }
      const row = target.closest('.form-row');
      if (row) {
        const candidates = Array.from(row.querySelectorAll('input, textarea'));
        const rowInput = candidates.find((item) => isOskEligibleInput(item));
        if (rowInput) {
          setKeyboardTarget(rowInput);
          return;
        }
      }
      const input = target.closest('input[data-osk-target], textarea[data-osk-target], .osk-input');
      if (isOskEligibleInput(input)) {
        setKeyboardTarget(input);
        return;
      }
      const active = document.activeElement;
      if (isOskEligibleInput(active) && target.closest('.modal')) return;
      if (document.body.classList.contains('view-login') && target.closest('.login-panel')) return;
      hideKeyboard();
    });
  }

  function isShieldHealthy(side) {
    const presentRaw = state.shields[side];
    const presentNum = typeof presentRaw === 'string' ? Number(presentRaw) : Number(presentRaw);
    return presentRaw === true || presentNum === 1; // 高电平 = 在线
  }

  function updateDeviceStatusUI() {
    const statusNode = document.getElementById('deviceStatusText');
    if (statusNode) {
      const status = state.connecting
        ? t('deviceStatusConnecting')
        : state.connected
          ? t('deviceStatusConnected')
          : t('deviceStatusDisconnected');
      statusNode.textContent = status;
    }
    const autoToggle = document.getElementById('deviceAutoReconnect');
    if (autoToggle) autoToggle.checked = !!state.settings.autoConnect;

    const calibNode = document.getElementById('deviceCalibrationValue');
    if (calibNode) {
      const last = state.settings.lastCalibrationAt
        ? new Date(state.settings.lastCalibrationAt)
        : null;
      if (!last || Number.isNaN(last.getTime())) {
        calibNode.textContent = t('deviceCalibrationNever');
      } else {
        const dateText = formatDateYMD(last);
        const elapsedDays = Math.floor((Date.now() - last.getTime()) / (24 * 60 * 60 * 1000));
        const remaining = CALIBRATION_INTERVAL_DAYS - elapsedDays;
        const dueText =
          remaining >= 0
            ? t('deviceCalibrationDue').replace('{days}', String(remaining))
            : t('deviceCalibrationOverdue').replace('{days}', String(Math.abs(remaining)));
        calibNode.textContent = `${t('deviceCalibrationAt').replace('{date}', dateText)} · ${dueText}`;
      }
    }
  }

  function setStatusChip(node, level) {
    if (!node) return;
    node.classList.remove('status-ok', 'status-warn', 'status-bad');
    if (level) node.classList.add(`status-${level}`);
  }

  function classifyStatusValue(value) {
    if (value == null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value <= 0) return 'ok';
      if (value <= 2) return 'warn';
      return 'bad';
    }
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === '--') return null;
    if (['0', 'ok', 'normal', 'ready', 'running', 'standby'].includes(text)) return 'ok';
    if (text.includes('warn') || text.includes('warning') || text.includes('警') || text.includes('注意')) {
      return 'warn';
    }
    if (
      text.includes('err') ||
      text.includes('error') ||
      text.includes('fault') ||
      text.includes('alarm') ||
      text.includes('异常') ||
      text.includes('错误')
    ) {
      return 'bad';
    }
    return null;
  }

  function updateStatusChips() {
    const connLevel = state.connected ? 'ok' : state.connecting ? 'warn' : 'bad';
    setStatusChip(document.getElementById('connectionState'), connLevel);
    setStatusChip(document.getElementById('alarmState'), classifyStatusValue(state.alarmState));
    setStatusChip(document.getElementById('systemState'), classifyStatusValue(state.systemState));
    setStatusChip(document.getElementById('runState'), state.running ? 'ok' : null);
  }

  function setConnected(on) {
    state.connected = on;
    if (on) state.connecting = false;
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
    updateDeviceStatusUI();
    updateStatusChips();
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
    if (!state.settings.autoConnect) return;
    state.autoConnectTimer = setTimeout(() => {
      state.autoConnectTimer = null;
      attemptAutoConnect();
    }, Math.max(0, delay));
  }

  async function attemptAutoConnect(opts = {}) {
    if (WEB_DEBUG) return;
    if (!opts.force && !state.settings.autoConnect) return;
    if (state.connected || state.connecting || !api?.connect) return;
    state.connecting = true;
    updateDeviceStatusUI();
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
      updateDeviceStatusUI();
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
    const durationSlider = document.getElementById('treatDuration');
    if (durationSlider) {
      const minutes = Math.max(0, Math.min(12, Number(durationSlider.value || 0)));
      updateDurationTargetDisplay(minutes);
      if (!state.running) {
        state.targets.durationMin = minutes;
        updateCountdownDisplay(minutes * 60 * 1000);
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
    set('#treatmentRunningTitle', 'treatmentRunningTitle');
    set('#treatmentRunningText', 'treatmentRunningText');
    set('#treatmentRunningOk', 'treatmentRunningOk');
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
    const batchBtn = document.getElementById('btnBatchExport');
    if (batchBtn) batchBtn.textContent = t('batchExport');
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
    };
    Object.entries(labelMap).forEach(([selector, key]) => {
      const el = document.querySelector(selector);
      if (el && TRANSLATIONS[next]?.[key]) el.textContent = TRANSLATIONS[next][key];
    });
    set('#btnSelectPatientPage', 'patientSelectPage');

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
    const quickSearch = document.getElementById('quickPatientSearch');
    if (quickSearch) quickSearch.placeholder = t('quickPatientSearchPlaceholder');
    set('#recommendPlanTitle', 'recommendPlanTitle');
    set('#photoModalTitle', 'photoModalTitle');
    set('#photoCaptureCancel', 'actionCancel');
    set('#photoCaptureTake', 'photoCapture');
    set('#patientDeleteTitle', 'patientDeleteTitle');
    set('#patientDeleteText', 'patientDeleteText');
    set('#patientDeleteCancel', 'actionCancel');
    set('#patientDeleteConfirm', 'actionConfirm');
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
    const eyeLabels = $$('.shield-oval-label');
    if (eyeLabels[0]) eyeLabels[0].textContent = t('leftEye');
    if (eyeLabels[1]) eyeLabels[1].textContent = t('rightEye');

    set('.treatment-panel .panel-overline', 'controlOverline');
    set('.treatment-panel .panel-title', 'controlTitle');
    set('.slider-card[data-kind=\"duration\"] .eyebrow', 'durationEyebrow');
    set('#durationCurrentLabel', 'durationCurrentLabel');
    set('#durationRemainingLabel', 'durationRemainingLabel');

    const navBtns = $$('.settings-nav button');
    const navMap = {
      accounts: ['navAccounts', 'navAccountsHint'],
      about: ['navAbout', 'navAboutHint'],
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

    const accountsCard = document.querySelector('#settingsModuleAccounts .settings-card');
    if (accountsCard) {
      const h3 = accountsCard.querySelector('h3');
      if (h3) h3.textContent = t('accountsTitle');
      const logoutBtn = document.getElementById('btnLogout');
      if (logoutBtn) logoutBtn.textContent = t('accountsLogoutBtn');
    }
    set('#autosaveRestoreTitle', 'autoSaveTitle');
    set('#autosaveRestoreText', 'autoSaveText');
    set('#btnAutosaveRestore', 'autoSaveRestore');
    set('#btnAutosaveDiscard', 'autoSaveDiscard');

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
      const navLabels = {
        quick: t('bottomNavQuick'),
        patientList: t('bottomNavPatients'),
        reportArchive: t('bottomNavReports'),
        settings: t('bottomNavSettings'),
      };
      bottomNav.querySelectorAll('.nav-item').forEach((btn) => {
        const view = btn.dataset.view;
        const label = btn.querySelector('.label');
        if (label && navLabels[view]) label.textContent = navLabels[view];
      });
    }

    
    const aboutCard = document.querySelector('#settingsModuleAbout .settings-card');
    if (aboutCard) {
      const h3 = aboutCard.querySelector('h3');
      if (h3) h3.textContent = t('aboutTitle');
      const metaLabels = aboutCard.querySelectorAll('.settings-meta .label');
      if (metaLabels[0]) metaLabels[0].textContent = t('aboutFirmware');
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
    updateUserBadge();
    updateCurveActions();
    updateDeviceStatusUI();
    renderOperationHistory();
    updateUndoButton();
    checkPatientIdInput({ skipFill: true });
    attachCustomSelectAll();
    const titleMap = {
      home: t('homeTitle'),
      quick: t('quickTitle'),
      patientList: t('patientListTitle'),
      reportArchive: t('reportArchiveTitle'),
      report: t('reportScreenTitle'),
      settings: t('settingsTitle'),
      newPatient: t('newPatientTitle'),
      engineer: t('engineerTitle'),
    };
    if (titleMap[state.currentView]) document.title = titleMap[state.currentView];
  }

  function applyTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    state.settings.theme = next;
    document.body.classList.toggle('theme-light', next === 'light');
    document.body.classList.toggle('theme-dark', next === 'dark');
  }

  const fontScaleCache = new WeakMap();
  let appliedFontScale = 1;
  let fontScaleObserver = null;

  function applyFontScaleToElement(el, scale, baseScale) {
    if (!(el instanceof HTMLElement)) return;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK') return;
    if (el.dataset && el.dataset.noFontScale != null) return;
    let base = fontScaleCache.get(el);
    if (base == null) {
      const size = Number.parseFloat(getComputedStyle(el).fontSize);
      if (!size) return;
      base = size / (baseScale || 1);
      fontScaleCache.set(el, base);
    }
    el.style.fontSize = `${base * scale}px`;
  }

  function applyFontScaleToTree(root, scale, baseScale) {
    if (!root) return;
    if (root.nodeType === 1) applyFontScaleToElement(root, scale, baseScale);
    if (!root.querySelectorAll) return;
    root.querySelectorAll('*').forEach((el) => applyFontScaleToElement(el, scale, baseScale));
  }

  function ensureFontScaleObserver() {
    if (fontScaleObserver || !document.body) return;
    fontScaleObserver = new MutationObserver((mutations) => {
      const scale = appliedFontScale;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          applyFontScaleToTree(node, scale, 1);
        });
      });
    });
    fontScaleObserver.observe(document.body, { childList: true, subtree: true });
  }

  function applyFontScale(scale) {
    const next = clampFontScale(scale);
    const prev = appliedFontScale;
    state.settings.fontScale = next;
    document.body.style.zoom = '1';
    applyFontScaleToTree(document.body, next, prev);
    appliedFontScale = next;
    ensureFontScaleObserver();
  }

  function updateSettingsUI() {
    const brightness = document.getElementById('settingsBrightness');
    const brightnessValue = document.getElementById('settingsBrightnessValue');
    const brightnessPct = clampBrightness(state.settings.brightness);
    if (brightness) brightness.value = brightnessPct;
    if (brightnessValue) brightnessValue.textContent = `${brightnessPct}%`;
    if (brightness) updateRangeFill(brightness);
    bindRangeFill(brightness);

    const screensaver = document.getElementById('screensaverSelect');
    if (screensaver) screensaver.value = String(state.settings.screensaver);
    const saverChip = document.getElementById('screensaverValue');
    if (saverChip) saverChip.textContent = `${state.settings.screensaver} min`;
    updateCustomSelectDisplay(screensaver);

    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = state.settings.theme === 'light' ? 'light' : 'dark';
    const fontScaleSelect = document.getElementById('fontScaleSelect');
    if (fontScaleSelect) fontScaleSelect.value = String(clampFontScale(state.settings.fontScale));
    updateCustomSelectDisplay(themeSelect);
    updateCustomSelectDisplay(fontScaleSelect);

    const volume = document.getElementById('settingsVolume');
    const volumeValue = document.getElementById('settingsVolumeValue');
    const volPct = clampVolume(state.settings.volume);
    if (volume) volume.value = volPct;
    if (volumeValue) volumeValue.textContent = `${volPct}%`;
    if (volume) updateRangeFill(volume);
    bindRangeFill(volume);

    const langZh = document.getElementById('languageZh');
    const langEn = document.getElementById('languageEn');
    if (langZh) langZh.checked = state.settings.language === 'zh';
    if (langEn) langEn.checked = state.settings.language === 'en';
    const langChip = document.getElementById('languageValue');
    if (langChip) langChip.textContent = state.settings.language === 'zh' ? TRANSLATIONS.zh.langZh : TRANSLATIONS.en.langEn;

    const chimeToggle = document.getElementById('chimeToggle');
    if (chimeToggle) chimeToggle.checked = !!state.settings.playChime;
    const pressureToggle = document.getElementById('pressureAlertToggle');
    if (pressureToggle) pressureToggle.checked = !!state.settings.pressureAlertSound;

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

    updateDeviceStatusUI();
  }

  let logsCache = [];
  let activeLogName = null;

  function setSettingsModule(moduleKey) {
    let next = moduleKey || state.settingsActiveModule || 'accounts';
    const navBtn = document.querySelector(`.settings-nav button[data-module="${next}"]`);
    if (!navBtn || navBtn.hidden) next = 'accounts';
    state.settingsActiveModule = next;
    $$('.settings-module').forEach((mod) => {
      mod.classList.toggle('active', mod.dataset.module === next);
    });
    $$('.settings-nav button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.module === next);
    });
  }

  async function loadLogsList(preselect) {
    const listNode = document.getElementById('logsList');
    const viewerNode = document.getElementById('logContent');
    if (!listNode) return;
    setupDragScroll(listNode);
    if (viewerNode) setupDragScroll(viewerNode);
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
  let pendingAccountRemove = null;

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

  function setAccountRemoveMessage(msg, isError = false) {
    const node = document.getElementById('accountRemoveMessage');
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

  function openAccountRemoveModal(username) {
    const modal = document.getElementById('accountRemoveModal');
    if (!modal) return;
    pendingAccountRemove = username;
    setAccountRemoveMessage(null);
    modal.hidden = false;
  }

  function closeAccountRemoveModal() {
    const modal = document.getElementById('accountRemoveModal');
    if (modal) modal.hidden = true;
    pendingAccountRemove = null;
    hideKeyboard();
  }

  async function confirmAccountRemove() {
    if (!pendingAccountRemove) return;
    if (state.user?.role !== 'admin') {
      setAccountRemoveMessage(t('adminOnly'), true);
      return;
    }
    try {
      await api?.removeAccount?.(pendingAccountRemove);
      closeAccountRemoveModal();
      await loadAccounts();
    } catch (err) {
      console.warn('[PPHC] remove account failed', err);
      setAccountRemoveMessage(t('accountsRemoveFailed'), true);
    }
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
      sub.textContent = getRoleLabel(acc.role ? String(acc.role) : 'user');
      meta.append(title, sub);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'account-remove';
      removeBtn.textContent = t('accountsRemoveBtn');
      const isAdmin = state.user?.role === 'admin';
      removeBtn.hidden = !isAdmin;
      removeBtn.disabled = String(acc.username || '').toLowerCase() === 'admin';
      removeBtn.addEventListener('click', async () => {
        if (removeBtn.disabled) return;
        openAccountRemoveModal(acc.username);
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
    const roleNode = document.getElementById('accountRole');
    const username = u?.value?.trim() || '';
    const password = p?.value || '';
    const password2 = p2?.value || '';
    const role = roleNode?.value || 'operator';
    const safeRole = role === 'admin' ? 'admin' : 'operator';
    if (state.user?.role !== 'admin') {
      setAccountsMessage(t('adminOnly'), true);
      return;
    }
    if (!username || !password) {
      setAccountsMessage(t('accountsAddFailed'), true);
      return;
    }
    if (!isValidUsername(username)) {
      setAccountsMessage(t('usernameFormatHint'), true);
      return;
    }
    if (password !== password2) {
      setAccountsMessage(t('accountsPasswordMismatch'), true);
      return;
    }
    try {
      await api?.addAccount?.({
        username,
        password,
        role: safeRole,
      });
      if (u) u.value = '';
      if (p) p.value = '';
      if (p2) p2.value = '';
      if (roleNode) roleNode.value = 'operator';
      setAccountsMessage(t('accountsAddSuccess'), false);
      await loadAccounts();
      hideKeyboard();
    } catch (err) {
      console.warn('[PPHC] add account failed', err);
      const msg = String(err?.message || err || '');
      if (msg.includes('exists')) {
        setAccountsMessage(t('usernameExists'), true);
        return;
      }
      if (msg.includes('unauthorized')) {
        setAccountsMessage(t('adminOnly'), true);
        return;
      }
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

  async function syncPressureAlertSound() {
    if (!api?.getPressureAlertSound) return;
    try {
      const info = await api.getPressureAlertSound();
      if (info && typeof info.on === 'boolean') {
        state.settings.pressureAlertSound = info.on;
        updateSettingsUI();
      }
    } catch (err) {
      console.warn('[PPHC] getPressureAlertSound failed', err);
    }
  }

  async function syncAppSettings() {
    if (!api?.getSettings) return;
    try {
      const info = await api.getSettings();
      if (!info) return;
      if (typeof info.language === 'string') {
        state.settings.language = info.language === 'en' ? 'en' : 'zh';
      }
      if (typeof info.theme === 'string') {
        state.settings.theme = info.theme === 'light' ? 'light' : 'dark';
      }
      if (info.fontScale != null) {
        state.settings.fontScale = clampFontScale(info.fontScale);
      }
      if (typeof info.autoConnect === 'boolean') {
        state.settings.autoConnect = info.autoConnect;
      }
      if ('lastCalibrationAt' in info) {
        state.settings.lastCalibrationAt = info.lastCalibrationAt || null;
      }
      applyTheme(state.settings.theme);
      applyFontScale(state.settings.fontScale);
      applyLanguage(state.settings.language || 'zh');
      updateSettingsUI();
      if (!state.settings.autoConnect && state.autoConnectTimer) {
        clearTimeout(state.autoConnectTimer);
        state.autoConnectTimer = null;
      } else if (state.settings.autoConnect && state.loggedIn && !state.connected) {
        scheduleAutoConnect(0);
      }
    } catch (err) {
      console.warn('[PPHC] getSettings failed', err);
    }
  }

  async function persistAppSettings(patch = {}) {
    if (!api?.updateSettings) return;
    try {
      const info = await api.updateSettings(patch);
      if (!info) return;
      if (typeof info.language === 'string') {
        state.settings.language = info.language === 'en' ? 'en' : 'zh';
      }
      if (typeof info.theme === 'string') {
        state.settings.theme = info.theme === 'light' ? 'light' : 'dark';
      }
      if (info.fontScale != null) {
        state.settings.fontScale = clampFontScale(info.fontScale);
      }
      if (typeof info.autoConnect === 'boolean') {
        state.settings.autoConnect = info.autoConnect;
      }
      if ('lastCalibrationAt' in info) {
        state.settings.lastCalibrationAt = info.lastCalibrationAt || null;
      }
      applyTheme(state.settings.theme);
      applyFontScale(state.settings.fontScale);
      updateSettingsUI();
      if (!state.settings.autoConnect && state.autoConnectTimer) {
        clearTimeout(state.autoConnectTimer);
        state.autoConnectTimer = null;
      } else if (state.settings.autoConnect && state.loggedIn && !state.connected) {
        scheduleAutoConnect(0);
      }
    } catch (err) {
      console.warn('[PPHC] updateSettings failed', err);
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

  function rebuildCustomSelectOptions(selectEl) {
    if (!selectEl || !selectEl._custom?.menu) return;
    const { menu } = selectEl._custom;
    const items = [];
    menu.innerHTML = '';
    Array.from(selectEl.options).forEach((opt) => {
      const item = document.createElement('div');
      item.className = 'custom-select-item';
      item.dataset.value = opt.value;
      item.innerHTML = `<span>${opt.textContent}</span>`;
      item.addEventListener('click', () => {
        selectEl.value = opt.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateCustomSelectDisplay(selectEl);
      });
      menu.appendChild(item);
      items.push(item);
    });
    selectEl._custom.items = items;
    updateCustomSelectDisplay(selectEl);
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
    setupDragScroll(menu);
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

    const closeOtherCustomSelects = () => {
      document.querySelectorAll('.custom-select.open').forEach((node) => {
        if (node !== wrapper) node.classList.remove('open');
      });
    };
    const toggle = () => {
      const isOpen = wrapper.classList.contains('open');
      if (!isOpen) closeOtherCustomSelects();
      wrapper.classList.toggle('open', !isOpen);
    };
    display.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
    select.addEventListener('change', () => updateCustomSelectDisplay(select));

    select._custom = { wrapper, labelNode: display.querySelector('.label'), items, menu };
    updateCustomSelectDisplay(select);
  }

  function attachCustomSelectAll() {
    document.querySelectorAll('select').forEach((select) => {
      if (!select.id) return;
      if (select.dataset.nativeSelect === 'true') return;
      if (select._custom) {
        rebuildCustomSelectOptions(select);
        return;
      }
      attachCustomSelect(select.id);
    });
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
    const { visibleMax, yMin, yMax, target, windowSize, history } = cfg || {};
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const targetRaw = typeof target === 'function' ? target() : target;
    const targetVal = Number.isFinite(targetRaw) ? Number(targetRaw) : null;
    const window = Math.max(10, Math.round(Number(windowSize) || canvas.width));
    const samples = Array.isArray(data) ? data.slice(-window) : [];
    const historySets = Array.isArray(history) ? history : [];
    if (!samples.length && targetVal == null && !historySets.length) return;

    const vals = samples.slice();
    historySets.forEach((hist) => {
      if (Array.isArray(hist) && hist.length) {
        vals.push(...hist.slice(-window));
      }
    });
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
    const axisHeight = 0;
    const plotHeight = Math.max(20, canvas.height - axisHeight);
    const yFor = (v) => plotHeight * (1 - (v - minVal) / range);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (historySets.length) {
      historySets.forEach((hist, idx) => {
        const histSamples = Array.isArray(hist) ? hist.slice(-window) : [];
        if (!histSamples.length) return;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = color.replace('0.9', '0.35');
        ctx.lineWidth = 1.4;
        histSamples.forEach((val, hIdx) => {
          const x = (hIdx / (histSamples.length - 1 || 1)) * canvas.width;
          const y = yFor(val);
          if (hIdx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
      });
    }

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

    // Bottom axis removed for quick-treatment curves.
  }

  function getCurveWindowSize() {
    const zoom = Number(state.curveZoom) || 1;
    return Math.max(30, Math.round(state.max / Math.max(1, zoom)));
  }

  function updateCurveActions() {
    const historyBtn = document.getElementById('btnCurveHistory');
    if (historyBtn) {
      historyBtn.textContent = state.historyEnabled ? t('curveHistoryOn') : t('curveHistoryOff');
    }
    const zoomBtn = document.getElementById('btnCurveZoom');
    if (zoomBtn) {
      zoomBtn.textContent = t('curveZoomLabel').replace('{zoom}', String(state.curveZoom));
    }
  }

  function captureHistorySnapshot() {
    const maxHistory = 3;
    [0, 1, 2, 3].forEach((ch) => {
      const snap = Array.isArray(state.buf[ch]) ? state.buf[ch].slice() : [];
      if (!state.historyBufs[ch]) state.historyBufs[ch] = [];
      if (snap.length) state.historyBufs[ch].unshift(snap);
      if (state.historyBufs[ch].length > maxHistory) state.historyBufs[ch].pop();
    });
  }

  async function persistLastTreatment() {
    const patientId = String(state.treatmentPatientId || '').trim();
    if (!patientId || !state.lastTreatment || !api?.updatePatient) return;
    const endedAt = new Date().toISOString();
    const patch = {
      lastTreatment: { ...state.lastTreatment, endedAt },
      lastParams: {
        pressureMmHg: state.lastTreatment.pressureMmHg,
        durationMin: state.lastTreatment.durationMin,
        tempC: state.lastTreatment.tempC,
        mode: state.lastTreatment.mode,
      },
      curveSnapshot: {
        0: Array.isArray(state.buf[0]) ? state.buf[0].slice() : [],
        1: Array.isArray(state.buf[1]) ? state.buf[1].slice() : [],
        2: Array.isArray(state.buf[2]) ? state.buf[2].slice() : [],
        3: Array.isArray(state.buf[3]) ? state.buf[3].slice() : [],
      },
    };
    try {
      const updated = await api.updatePatient({ id: patientId, patch });
      if (updated && updated.id) {
        state.patients = state.patients.map((p) =>
          String(p?.id || '') === patientId ? { ...p, ...patch } : p
        );
        if (state.activePatient && String(state.activePatient.id || '') === patientId) {
          state.activePatient = { ...state.activePatient, ...patch };
        }
        if (state.currentView === 'quick') {
          renderQuickPatientPicker();
        }
        if (state.currentView === 'patientList') {
          renderPatientList();
        }
      }
    } catch (err) {
      console.warn('[PPHC] persist treatment failed', err);
    }
  }

  async function persistTreatmentStart() {
    const patientId = String(state.treatmentPatientId || '').trim();
    if (!patientId || !state.lastTreatment || !api?.updatePatient) return;
    const patch = {
      lastTreatment: { ...state.lastTreatment },
      lastParams: {
        pressureMmHg: state.lastTreatment.pressureMmHg,
        durationMin: state.lastTreatment.durationMin,
        tempC: state.lastTreatment.tempC,
        mode: state.lastTreatment.mode,
      },
    };
    try {
      const updated = await api.updatePatient({ id: patientId, patch });
      if (updated && updated.id) {
        state.patients = state.patients.map((p) =>
          String(p?.id || '') === patientId ? { ...p, ...patch } : p
        );
        if (state.activePatient && String(state.activePatient.id || '') === patientId) {
          state.activePatient = { ...state.activePatient, ...patch };
        }
        if (state.currentView === 'quick') renderQuickPatientPicker();
        if (state.currentView === 'patientList') renderPatientList();
      }
    } catch (err) {
      console.warn('[PPHC] persist start params failed', err);
    }
  }

  function logPressureEvent(side, active, value) {
    if (!api?.logToMain) return;
    const label = side === 'left' ? '左眼' : '右眼';
    const safeVal = Number.isFinite(value) ? Number(value).toFixed(0) : '--';
    const msg = active
      ? `压力超限: ${label} ${safeVal} mmHg`
      : `压力恢复: ${label} ${safeVal} mmHg`;
    api.logToMain({ level: active ? 'warn' : 'info', message: msg, source: 'renderer' });
  }

  function updatePressureAlertStatus() {
    const leftVal = typeof state.latest[0] === 'number' ? state.latest[0] : NaN;
    const rightVal = typeof state.latest[2] === 'number' ? state.latest[2] : NaN;
    const baseTarget = Number.isFinite(state.targets.pressure)
      ? Number(state.targets.pressure)
      : PRESSURE_ALERT_FALLBACK;
    const threshold = baseTarget + PRESSURE_ALERT_OFFSET;
    const leftAlert = Number.isFinite(leftVal) && leftVal > threshold;
    const rightAlert = Number.isFinite(rightVal) && rightVal > threshold;

    const leftNodes = [document.getElementById('pressureLeft'), document.getElementById('pressureLeftLabel')];
    const rightNodes = [document.getElementById('pressureRight'), document.getElementById('pressureRightLabel')];
    leftNodes.forEach((node) => node?.classList.toggle('value-alert', leftAlert));
    rightNodes.forEach((node) => node?.classList.toggle('value-alert', rightAlert));

    if (leftAlert !== state.pressureAlerted.left) {
      logPressureEvent('left', leftAlert, leftVal);
      state.pressureAlerted.left = leftAlert;
    }
    if (rightAlert !== state.pressureAlerted.right) {
      logPressureEvent('right', rightAlert, rightVal);
      state.pressureAlerted.right = rightAlert;
    }

    if ((leftAlert || rightAlert) && state.settings.pressureAlertSound) {
      const now = Date.now();
      if (now - state.pressureAlertLastSound > PRESSURE_ALERT_SOUND_COOLDOWN) {
        playSound('pressureHigh');
        state.pressureAlertLastSound = now;
      }
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
    const windowSize = getCurveWindowSize();
    sparkTargets.forEach((target) =>
      drawSparkline(target.canvas(), state.buf[target.key], target.color, {
        ...target,
        windowSize,
        history: state.historyEnabled ? state.historyBufs[target.key] : [],
      })
    );
    updatePressureAlertStatus();
    updateHeartbeatUI();
  }

  function ensureTelemetryLoop() {
    if (state.telemetryTimer) return;
    state.telemetryTimer = setInterval(updateTelemetry, 1000);
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
    document.body.classList.toggle('treatment-running', !!state.running);
    const durationSlider = document.getElementById('treatDuration');
    if (durationSlider) durationSlider.disabled = !!state.running;
    updateStatusChips();
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

  function showTreatmentRunningModal() {
    const modal = document.getElementById('treatmentRunningModal');
    if (modal) {
      modal.hidden = false;
      return;
    }
    showAlert(t('treatmentRunningText'));
  }

  function closeTreatmentRunningModal() {
    const modal = document.getElementById('treatmentRunningModal');
    if (modal) modal.hidden = true;
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

  function updateRangeFill(slider) {
    if (!slider) return;
    const min = Number(slider.min ?? 0);
    const max = Number(slider.max ?? 100);
    const value = Number(slider.value ?? min);
    const range = max - min || 1;
    const ratio = Math.max(0, Math.min(1, (value - min) / range));
    slider.style.setProperty('--range-ratio', ratio.toFixed(4));
  }

  function bindRangeFill(slider) {
    if (!slider || slider._rangeFillBound) return;
    slider._rangeFillBound = true;
    updateRangeFill(slider);
    requestAnimationFrame(() => updateRangeFill(slider));
    slider.addEventListener('input', () => updateRangeFill(slider));
    slider.addEventListener('change', () => updateRangeFill(slider));
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
    if (!state.running) return;
    const now = Date.now();
    const remain = Math.max(0, state.countdownEnd - now);
    updateCountdownDisplay(remain);
    const totalMs = Number.isFinite(state.countdownTotalMs)
      ? state.countdownTotalMs
      : Math.max(0, Number(state.lastTreatment?.durationMin || 0) * 60 * 1000);
    const elapsed = totalMs ? Math.max(0, totalMs - remain) : Math.max(0, now - state.countdownStart);
    updateElapsedDisplay(elapsed);
    if (remain <= 0) {
      // 自动停止
      api.sendU8(0x10c2, 1);
      captureHistorySnapshot();
      persistLastTreatment();
      clearAutoSaveSnapshot();
      state.running = false;
      state.activeSides = [];
      state.shieldDropShown = false;
      if (state.countdownTimer) {
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
      }
      state.countdownStart = 0;
      state.countdownTotalMs = 0;
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
      },
      right: {
        wrap: document.getElementById('shieldRight'),
        state: document.getElementById('shieldRightState'),
      },
    };
    Object.entries(map).forEach(([side, refs]) => {
      if (!refs.wrap) return;
      const online = !!state.shields[side];
      const fuseVal = state.shieldDetail[`${side}Fuse`];
      const fuseNum = typeof fuseVal === 'string' ? Number(fuseVal) : Number(fuseVal);
      const hasFuse = fuseVal !== null && fuseVal !== undefined && fuseVal !== '';
      const isFault = hasFuse && fuseNum === 0;
      let status = 'offline';
      let label = t('shieldOffline');
      if (online) {
        status = isFault ? 'fault' : 'ok';
        label = isFault ? t('fuseBlown') : t('fuseOk');
      }
      refs.wrap.classList.remove('offline', 'ok', 'fault');
      refs.wrap.classList.add(status);
      if (refs.state) refs.state.textContent = label;
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
    ensureTreatmentPatientSelected();
    clearTelemetryBuffers();
    setModeStage('--');
    state.pendingSides = null;
    state.activeSides = sides.slice();
    state.shieldDropShown = false;
    api.sendU8(0x1004, enableLeft ? 1 : 0);
    api.sendU8(0x1005, enableRight ? 1 : 0);
    const tempC = Number.isFinite(Number(state.targets.temp)) ? Number(state.targets.temp) : TEMP_FIXED_C;
    api.sendF32(0x1002, tempC);
    const mmHg = FIXED_PRESSURE_MMHG;
    state.targets.pressure = mmHg;
    api.sendF32(0x1001, mmHg); // 发送原始 mmHg
    api.sendU8(0x10c0, state.mode || 1);
    const sliderMin = Math.max(
      0,
      Math.min(12, Number(document.getElementById('treatDuration')?.value || 0))
    );
    const min = sliderMin;
    state.targets.durationMin = min;
    state.lastTreatment = {
      startedAt: new Date().toISOString(),
      pressureMmHg: mmHg,
      durationMin: min,
      mode: state.mode || 1,
      sides: sides.slice(),
      tempC,
    };
    persistTreatmentStart();
    api.sendU16(0x1006, min);
    api.sendU8(0x10c1, 1);
    state.running = true;
    state.countdownStart = Date.now();
    state.countdownTotalMs = min * 60 * 1000;
    state.countdownEnd = state.countdownStart + state.countdownTotalMs;
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    state.countdownTimer = setInterval(updateCountdown, 250);
    updateElapsedDisplay(0);
    updateRunState();
    saveAutoProgress({ manual: false });
    playSound('start');
  }

  function handleShieldDropOffline() {
    if (!state.running || state.shieldDropShown) return;
    state.shieldDropShown = true;
    api.sendU8(0x10c2, 1);
    captureHistorySnapshot();
    persistLastTreatment();
    clearAutoSaveSnapshot();
    state.running = false;
    state.activeSides = [];
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
    state.countdownEnd = 0;
    state.countdownStart = 0;
    state.countdownTotalMs = 0;
    updateElapsedDisplay(0);
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
      brightness.min = String(MIN_BRIGHTNESS);
      bindRangeFill(brightness);
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

    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = state.settings.theme === 'light' ? 'light' : 'dark';
      themeSelect.addEventListener('change', () => {
        state.settings.theme = themeSelect.value === 'light' ? 'light' : 'dark';
        applyTheme(state.settings.theme);
        updateSettingsUI();
        persistAppSettings({ theme: state.settings.theme });
      });
    }

    const fontScaleSelect = document.getElementById('fontScaleSelect');
    if (fontScaleSelect) {
      fontScaleSelect.value = String(clampFontScale(state.settings.fontScale));
      fontScaleSelect.addEventListener('change', () => {
        state.settings.fontScale = clampFontScale(fontScaleSelect.value);
        applyFontScale(state.settings.fontScale);
        updateSettingsUI();
        persistAppSettings({ fontScale: state.settings.fontScale });
      });
    }

    const volume = document.getElementById('settingsVolume');
    if (volume) {
      volume.value = clampVolume(state.settings.volume);
      bindRangeFill(volume);
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
      persistAppSettings({ language: state.settings.language });
    });
    document.getElementById('languageEn')?.addEventListener('change', () => {
      state.settings.language = 'en';
      applyLanguage('en');
      updateSettingsUI();
      persistAppSettings({ language: state.settings.language });
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

    const pressureToggle = document.getElementById('pressureAlertToggle');
    if (pressureToggle) {
      pressureToggle.checked = !!state.settings.pressureAlertSound;
      pressureToggle.addEventListener('change', () => {
        state.settings.pressureAlertSound = !!pressureToggle.checked;
        updateSettingsUI();
        api?.setPressureAlertSound?.(state.settings.pressureAlertSound);
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
    document.getElementById('accountRemoveCancel')?.addEventListener('click', closeAccountRemoveModal);
    document.getElementById('accountRemoveConfirm')?.addEventListener('click', confirmAccountRemove);
    document.getElementById('accountRemoveModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'accountRemoveModal') closeAccountRemoveModal();
    });

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
      'btnHomeDevice',
      'btnStartStop',
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
      'btnRefreshReportArchive',
      'btnBackEngineer',
      'btnExportPdf',
      'patientListPager',
      'btnSelectPatientPage',
      'patientDeleteModal',
      'patientDeleteCancel',
      'patientDeleteConfirm',
      'btnPrintReport',
      'btnGoPatientList',
      'patientForm',
      'autosaveRestoreModal',
      'btnAutosaveRestore',
      'btnAutosaveDiscard',
      'treatmentRunningModal',
      'treatmentRunningOk',
    ].forEach((id) => {
      if (!document.getElementById(id)) console.warn('[PPHC] missing element', id);
    });
    document.getElementById('btnHomeQuick')?.addEventListener('click', () => {
      showView('quick');
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
    document.getElementById('btnHomeDevice')?.addEventListener('click', () => showView('settings'));
    document.getElementById('btnBackNewPatient')?.addEventListener('click', () =>
      showView('home')
    );
    document.getElementById('btnBackPatientList')?.addEventListener('click', () =>
      showView('home')
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
    document.getElementById('patientDeleteCancel')?.addEventListener('click', closePatientDeleteModal);
    document.getElementById('patientDeleteConfirm')?.addEventListener('click', confirmPatientDelete);
    document.getElementById('patientDeleteModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'patientDeleteModal') closePatientDeleteModal();
    });
    document.getElementById('btnGoPatientList')?.addEventListener('click', () => {
      ensurePatientsLoaded();
      showView('patientList');
    });
    document.getElementById('btnAutosaveRestore')?.addEventListener('click', restoreAutoSaveSnapshot);
    document.getElementById('btnAutosaveDiscard')?.addEventListener('click', discardAutoSaveSnapshot);
    document.getElementById('autosaveRestoreModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'autosaveRestoreModal') discardAutoSaveSnapshot();
    });
    document.getElementById('patientForm')?.addEventListener('submit', handlePatientSubmit);
    const birthInput = document.getElementById('patientBirth');
    if (birthInput) {
      birthInput.addEventListener('input', () => {
        const formatted = formatBirthInput(birthInput.value);
        if (formatted && formatted !== birthInput.value) birthInput.value = formatted;
      });
    }
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
      const input = document.getElementById(datePickerState.targetId || 'patientBirth');
      if (input) input.value = datePickerState.selected;
      if (String(datePickerState.targetId || '').startsWith('filter')) {
        applyPatientFiltersFromUI();
      }
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


    document.getElementById('treatmentRunningOk')?.addEventListener('click', closeTreatmentRunningModal);
    document.getElementById('treatmentRunningModal')?.addEventListener('click', (e) => {
      if (e.target?.id === 'treatmentRunningModal') closeTreatmentRunningModal();
    });

    document.getElementById('btnStartStop')?.addEventListener('click', () => {
      console.info('[PPHC] start/stop clicked, connected=', state.connected, 'running=', state.running);
      if (!state.connected) return;
      if (state.running) {
        api.sendU8(0x10c2, 1);
        captureHistorySnapshot();
        persistLastTreatment();
        clearAutoSaveSnapshot();
        state.running = false;
        state.activeSides = [];
        state.shieldDropShown = false;
        setModeStage('--');
        if (state.countdownTimer) {
          clearInterval(state.countdownTimer);
          state.countdownTimer = null;
        }
        state.countdownEnd = 0;
        state.countdownStart = 0;
        state.countdownTotalMs = 0;
        updateRunState();
        updateModeMeta();
        showAlert('治疗已停止');
        playSound('stop');
      } else {
        handleStartClick();
      }
    });

    const durationSlider = document.getElementById('treatDuration');
    if (durationSlider)
      durationSlider.addEventListener('input', () => {
        const min = Math.max(0, Math.min(12, Number(durationSlider.value || 0)));
        updateDurationTargetDisplay(min);
        if (!state.running) {
          state.targets.durationMin = min;
          updateCountdownDisplay(min * 60 * 1000);
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
        const runningModal = document.getElementById('treatmentRunningModal');
        if (runningModal && !runningModal.hidden) closeTreatmentRunningModal();
        if (exportModal && !exportModal.hidden) exportModal.hidden = true;
        const autosaveModal = document.getElementById('autosaveRestoreModal');
        if (autosaveModal && !autosaveModal.hidden) discardAutoSaveSnapshot();
        const photoModal = document.getElementById('photoCaptureModal');
        if (photoModal && !photoModal.hidden) closePhotoCaptureModal();
        const patientDeleteModal = document.getElementById('patientDeleteModal');
        if (patientDeleteModal && !patientDeleteModal.hidden) closePatientDeleteModal();
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
        updateStatusChips();
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
        updateStatusChips();
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
        captureHistorySnapshot();
        persistLastTreatment();
        clearAutoSaveSnapshot();
        state.running = false;
        state.countdownEnd = 0;
        state.countdownStart = 0;
        state.countdownTotalMs = 0;
        updateElapsedDisplay(0);
        updateRunState();
        updateModeMeta();
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
    bindBottomNav();
    bindSwipeNav();
    wireIpc();
    state.operationHistory = loadOperationHistory();
    renderOperationHistory();
    updateUndoButton();
    updateModeMeta();
    updateStatusChips();
    updateSettingsUI();
    applyTheme(state.settings.theme);
    applyFontScale(state.settings.fontScale);
    syncSystemBrightness();
    syncSystemVolume();
    syncPlayChime();
    syncPressureAlertSound();
    syncPrinterSelection();
    syncAppSettings();
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
    if (STARTUP_AUDIO_ENABLED) setTimeout(runStartupAudioProbe, 800);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
