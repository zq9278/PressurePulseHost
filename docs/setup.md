# 新系统快速部署说明

适用场景：全新 Ubuntu（ARM64，如 RK3576）上启用本项目的 LED 驱动 + Piper 启动画播报。

## 需要的包
- 系统包：`curl`、`tar`、`alsa-utils`（aplay）、`sox`（转 48k 立体声）、`python3-pip`
- Node 依赖：项目目录下执行 `npm install`（已有 package.json / package-lock）
- Piper：通过 pip 安装 `piper-tts`（含二进制与依赖）
- Piper 模型：`zh_CN-huayan-medium.onnx` + 同目录的 `.json`

## 一键脚本
在仓库内提供了 `tools/setup-voice.sh`，以 root（或 sudo）运行：
```bash
cd /home/orin-nano/PressurePulseHostController_electron
sudo bash tools/setup-voice.sh
```
脚本完成的事情：
1. 安装系统包 `curl tar alsa-utils sox python3-pip`
2. 通过 pip 安装 `piper-tts`
3. 下载中文女声模型到 `piper-voices/zh_CN-huayan-medium.onnx` 与对应 `.json`

## 运行应用
```bash
cd /home/orin-nano/PressurePulseHostController_electron
npm install   # 只需首次或依赖变更时
npm start
```
主进程会自动寻找 `piper-voices/zh_CN-huayan-medium.onnx`；如需指定其他模型：
```bash
PPHC_PIPER_MODEL=/path/to/your.onnx npm start
```

## 额外建议
- 确认 `aplay` 能出声：`aplay /usr/share/sounds/alsa/Front_Center.wav`
- SPI / LED 权限：保证 udev 规则允许普通用户访问 `/dev/spidev0.0`
- 语音设备选择：若需指定声卡，可设置 `PPHC_APLAY_ARGS="-D plughw:0,0"` 后再 `npm start`
