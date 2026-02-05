#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
RUN_DEV=1

if [[ "${1:-}" == "--no-run" ]]; then
  RUN_DEV=0
fi

install_nvm() {
  if [[ ! -s "${NVM_DIR}/nvm.sh" ]]; then
    echo "[linux_dev] Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi
}

load_nvm() {
  # shellcheck disable=SC1090
  if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
    . "${NVM_DIR}/nvm.sh"
  else
    echo "[linux_dev] nvm not found at ${NVM_DIR}/nvm.sh"
    exit 1
  fi
}

install_node() {
  echo "[linux_dev] Installing Node LTS..."
  nvm install --lts
}

install_deps() {
  echo "[linux_dev] Installing dependencies..."
  npm install
}

ensure_mixer() {
  if command -v amixer >/dev/null 2>&1; then
    amixer -c 0 set 'spk switch' on >/dev/null 2>&1 || true
    amixer -c 0 set 'hp switch' on >/dev/null 2>&1 || true
    amixer -c 0 set 'Speaker' on >/dev/null 2>&1 || true
    amixer -c 0 set 'Headphone' on >/dev/null 2>&1 || true
    amixer -c 0 set 'OUT1' on >/dev/null 2>&1 || true
    amixer -c 0 set 'OUT2' on >/dev/null 2>&1 || true
    amixer -c 0 set 'Output 1' 100% >/dev/null 2>&1 || true
    amixer -c 0 set 'Output 2' 100% >/dev/null 2>&1 || true
    amixer -c 0 set 'PCM' 100% >/dev/null 2>&1 || true
  fi
}

run_dev() {
  echo "[linux_dev] Starting dev..."
  ensure_mixer
  export PPHC_AUDIO_GAIN="${PPHC_AUDIO_GAIN:-2.0}"
  export PPHC_DISABLE_APLAY="${PPHC_DISABLE_APLAY:-1}"
  env -u ELECTRON_RUN_AS_NODE npm run dev
}

main() {
  cd "${ROOT_DIR}"
  install_nvm
  load_nvm
  install_node
  install_deps
  if [[ "${RUN_DEV}" -eq 1 ]]; then
    run_dev
  else
    echo "[linux_dev] Done. Run: env -u ELECTRON_RUN_AS_NODE npm run dev"
  fi
}

main "$@"
