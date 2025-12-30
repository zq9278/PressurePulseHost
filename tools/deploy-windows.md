# Windows 部署与打包

本项目为 Electron 桌面应用，串口通信在 `electron/serial.js`，自动连接端口在 `renderer/main.js` 内硬编码。Windows 部署时需要留意串口号与设备差异。

## 前置条件
- Windows 10/11 x64
- Node.js 18+（建议 20 LTS）
- Git
- 若 serialport 需要编译：Visual Studio Build Tools 2022（C++ build tools）+ Python 3
- USB-转串口驱动（按硬件型号安装）

## 一键脚本
```powershell
powershell -ExecutionPolicy Bypass -File tools\deploy-windows.ps1 -Action pack
```

参数说明：
- `-Action install` 仅安装依赖并重建 native 模块
- `-Action dev` 本地开发运行
- `-Action pack` 打包 NSIS 安装包
- `-DebugWeb` 跳过串口连接（UI 演示）
- `-DebugMouse` 显示鼠标指针

## 端口配置（Windows 必改）
自动连接端口在 `renderer/main.js`：
- `AUTO_PORT = '/dev/ttyS1'` 需要改成实际 `COMx`
- `AUTO_BAUD = 115200` 如需修改波特率一并调整

目前 UI 没有手动选择端口入口，必须改完再打包。

## 打包产物
生成在 `dist\` 目录：
- `Pressure Pulse Controller Setup <version>.exe`
- `win-unpacked\`

## 亮度 / 音量说明
- Windows 下不会读写 `/sys/class/backlight`，亮度与音量仅保存到应用设置，不会影响系统亮度/音量。
- Linux 设备仍会走硬件控制逻辑。

## 数据与日志位置
默认使用 `app.getPath('userData')` 作为数据目录，可通过环境变量 `PPHC_DATA_DIR` 指定：
- 设置：`settings.json`
- 病例：`patients\patients.json`
- 报告：`reports\*.pdf`
- 日志：`logs\*.log`

## 调试
- 串口日志：`SERIAL_DEBUG=1` 开启，`SERIAL_DEBUG=0/false` 关闭（默认关闭）
- 发送间隔：`SERIAL_TX_GAP_MS=8`

## 常见问题
- 安装依赖失败或找不到 `serialport` 预编译：安装 VS Build Tools + Python 3 后执行 `npm run rebuild:electron`。
- UI 仅演示：使用 `-Action dev -DebugWeb` 启动。
