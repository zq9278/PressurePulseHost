#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="pphc-kiosk"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}.service"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo $0" >&2
  exit 1
fi

systemctl disable --now "${SERVICE_NAME}.service" || true
rm -f "$SERVICE_PATH"
systemctl daemon-reload

# Restore tty1 login.
systemctl unmask getty@tty1.service || true
systemctl enable --now getty@tty1.service || true

# Restore graphical target if desired.
systemctl set-default graphical.target

echo "Removed ${SERVICE_NAME}.service. Reboot to return to desktop." 
