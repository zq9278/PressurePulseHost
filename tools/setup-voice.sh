#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VOICE_DIR="${ROOT_DIR}/piper-voices"
MODEL_BASENAME="zh_CN-huayan-medium"
MODEL_URL_ONNX="https://huggingface.co/rhasspy/piper-voices/resolve/main/zh/zh_CN/huayan/medium/${MODEL_BASENAME}.onnx"
MODEL_URL_JSON="https://huggingface.co/rhasspy/piper-voices/resolve/main/zh/zh_CN/huayan/medium/${MODEL_BASENAME}.onnx.json"

echo "[setup] installing system packages..."
apt update
apt install -y curl tar alsa-utils sox python3-pip

echo "[setup] installing piper-tts via pip..."
python3 -m pip install -U piper-tts --break-system-packages

echo "[setup] preparing voice directory: ${VOICE_DIR}"
mkdir -p "${VOICE_DIR}"

echo "[setup] downloading model ${MODEL_BASENAME}..."
curl -L -o "${VOICE_DIR}/${MODEL_BASENAME}.onnx" "${MODEL_URL_ONNX}"
curl -L -o "${VOICE_DIR}/${MODEL_BASENAME}.onnx.json" "${MODEL_URL_JSON}"

echo "[setup] verifying downloads..."
ls -lh "${VOICE_DIR}/${MODEL_BASENAME}.onnx" "${VOICE_DIR}/${MODEL_BASENAME}.onnx.json"

echo "[setup] done. You can run:"
echo "  PPHC_PIPER_MODEL=\"${VOICE_DIR}/${MODEL_BASENAME}.onnx\" npm start"
