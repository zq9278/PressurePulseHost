#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/orin-nano/PressurePulseHost"
USER_HOME="/home/orin-nano"
LOG_FILE="/home/orin-nano/pphc-kiosk.log"

exec >>"$LOG_FILE" 2>&1
echo "==== pphc kiosk start $(date -Is) ===="
echo "uid=$(id -u) user=$(id -un) tty=$(tty || true) display=${DISPLAY-}"
env | sort

# Basic X session tweaks for kiosk use.
if command -v xset >/dev/null 2>&1; then
  xset s off || true
  xset -dpms || true
  xset s noblank || true
fi

# If unclutter exists, hide the cursor aggressively.
if command -v unclutter >/dev/null 2>&1; then
  unclutter -idle 0 -root &
fi

# Start a lightweight window manager if available.
if command -v openbox >/dev/null 2>&1; then
  openbox &
elif command -v matchbox-window-manager >/dev/null 2>&1; then
  matchbox-window-manager -use_cursor no &
fi

cd "$APP_DIR"

# Ensure node/npm from nvm is available.
export HOME="$USER_HOME"
export NVM_DIR="$USER_HOME/.nvm"
export DISPLAY="${DISPLAY:-:0}"
export XAUTHORITY="$USER_HOME/.Xauthority"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

if ! command -v npm >/dev/null 2>&1; then
  FALLBACK_NPM="$USER_HOME/.nvm/versions/node/v24.13.0/bin/npm"
  if [ -x "$FALLBACK_NPM" ]; then
    exec "$FALLBACK_NPM" run dev
  fi
  echo "[pphc-xsession] npm not found in PATH: $PATH" >&2
fi

exec npm run dev
