#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/orin-nano/PressurePulseHost"
USER_NAME="orin-nano"
SERVICE_NAME="pphc-kiosk"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
XSESSION_SCRIPT="$APP_DIR/tools/kiosk/pphc-xsession.sh"
APP_IMAGE_PATH="/home/${USER_NAME}/apps/PressurePulseController.AppImage"
BACKLIGHT_PATH="/sys/class/backlight/backlight2/brightness"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo $0" >&2
  exit 1
fi

if [ ! -x "$XSESSION_SCRIPT" ]; then
  echo "Missing xsession script: $XSESSION_SCRIPT" >&2
  exit 1
fi

cat > "$SERVICE_PATH" <<SERVICE
[Unit]
Description=PPHC Kiosk (start X + AppImage or npm dev fallback)
After=systemd-user-sessions.service network.target getty@tty1.service
Conflicts=getty@tty1.service

[Service]
Type=simple
User=${USER_NAME}
WorkingDirectory=/home/${USER_NAME}
PAMName=login
TTYPath=/dev/tty1
TTYReset=yes
TTYVHangup=yes
TTYVTDisallocate=yes
StandardInput=tty
StandardOutput=journal
StandardError=journal
PermissionsStartOnly=true
Environment=HOME=/home/${USER_NAME}
Environment=DISPLAY=:0
Environment=XDG_RUNTIME_DIR=/run/user/%U
Environment=ELECTRON_OZONE_PLATFORM_HINT=x11
Environment=LIBGL_ALWAYS_SOFTWARE=1
Environment=ELECTRON_DISABLE_GPU=1
Environment=PPHC_APP_IMAGE_PATH=${APP_IMAGE_PATH}
ExecStartPre=/bin/sh -c 'if [ -w "${BACKLIGHT_PATH}" ]; then cat "${BACKLIGHT_PATH}" > /run/pphc-backlight-prev || true; echo 0 > "${BACKLIGHT_PATH}" || true; fi'
ExecStart=/usr/bin/xinit ${XSESSION_SCRIPT} -- :0 -nolisten tcp vt1
ExecStartPost=/bin/sh -c 'if [ -w "${BACKLIGHT_PATH}" ]; then sleep 8; if [ -s /run/pphc-backlight-prev ]; then cat /run/pphc-backlight-prev > "${BACKLIGHT_PATH}" || true; else echo 200 > "${BACKLIGHT_PATH}" || true; fi; fi'
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
SERVICE

# Disable common desktop display managers if present.
for dm in gdm3 gdm lightdm sddm; do
  if systemctl list-unit-files | grep -q "^${dm}\.service"; then
    systemctl disable --now "${dm}.service" || true
  fi
done

# Prevent getty from fighting for tty1.
systemctl disable --now getty@tty1.service || true
systemctl mask getty@tty1.service || true

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"

# Boot into text mode to avoid desktop session.
systemctl set-default multi-user.target

echo "Installed ${SERVICE_NAME}.service. Reboot to start kiosk." 
