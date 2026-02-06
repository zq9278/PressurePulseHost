#!/usr/bin/env bash
set -euo pipefail

# Production installer:
# - Auto start AppImage at boot (kiosk mode on tty1)
# - Turn backlight off at startup and restore after 8 seconds
#
# Usage:
#   sudo ./tools/kiosk/install-kiosk-production.sh
#   sudo ./tools/kiosk/install-kiosk-production.sh --app-image /path/to/PressurePulseController.AppImage
#   sudo ./tools/kiosk/install-kiosk-production.sh --user orin-nano

USER_NAME="orin-nano"
APP_IMAGE_PATH_DEFAULT="/home/orin-nano/apps/PressurePulseController.AppImage"
APP_IMAGE_PATH="$APP_IMAGE_PATH_DEFAULT"
BACKLIGHT_PATH="/sys/class/backlight/backlight2/brightness"
SERVICE_NAME="pphc-kiosk"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
XSESSION_SCRIPT="/usr/local/bin/pphc-xsession-prod.sh"

while [ $# -gt 0 ]; do
  case "$1" in
    --user)
      USER_NAME="${2:-}"
      shift 2
      ;;
    --app-image)
      APP_IMAGE_PATH="${2:-}"
      shift 2
      ;;
    --backlight)
      BACKLIGHT_PATH="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

if [ -z "$USER_NAME" ] || [ -z "$APP_IMAGE_PATH" ] || [ -z "$BACKLIGHT_PATH" ]; then
  echo "Invalid empty argument." >&2
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo $0" >&2
  exit 1
fi

if ! id "$USER_NAME" >/dev/null 2>&1; then
  echo "User not found: $USER_NAME" >&2
  exit 1
fi

if [ ! -f "$APP_IMAGE_PATH" ]; then
  echo "AppImage not found: $APP_IMAGE_PATH" >&2
  exit 1
fi

USER_HOME="$(getent passwd "$USER_NAME" | cut -d: -f6)"
if [ -z "$USER_HOME" ] || [ ! -d "$USER_HOME" ]; then
  echo "Home directory not found for user: $USER_NAME" >&2
  exit 1
fi

cat > "$XSESSION_SCRIPT" <<EOF
#!/usr/bin/env bash
set -euo pipefail

APP_IMAGE_PATH="$APP_IMAGE_PATH"
USER_HOME="$USER_HOME"
LOG_FILE="\$USER_HOME/pphc-kiosk.log"

exec >>"\$LOG_FILE" 2>&1
echo "==== pphc kiosk(prod) start \$(date -Is) ===="
echo "uid=\$(id -u) user=\$(id -un) tty=\$(tty || true) display=\${DISPLAY-}"

if command -v xset >/dev/null 2>&1; then
  xset s off || true
  xset -dpms || true
  xset s noblank || true
fi

if command -v unclutter >/dev/null 2>&1; then
  unclutter -idle 0 -root &
fi

if command -v openbox >/dev/null 2>&1; then
  openbox &
elif command -v matchbox-window-manager >/dev/null 2>&1; then
  matchbox-window-manager -use_cursor no &
fi

export HOME="\$USER_HOME"
export DISPLAY="\${DISPLAY:-:0}"
export XAUTHORITY="\$USER_HOME/.Xauthority"

chmod +x "\$APP_IMAGE_PATH" 2>/dev/null || true
exec "\$APP_IMAGE_PATH"
EOF

chmod 0755 "$XSESSION_SCRIPT"
chown root:root "$XSESSION_SCRIPT"

cat > "$SERVICE_PATH" <<EOF
[Unit]
Description=PPHC Kiosk Production (X + AppImage + backlight 8s)
After=systemd-user-sessions.service network.target getty@tty1.service
Conflicts=getty@tty1.service

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$USER_HOME
PAMName=login
TTYPath=/dev/tty1
TTYReset=yes
TTYVHangup=yes
TTYVTDisallocate=yes
StandardInput=tty
StandardOutput=journal
StandardError=journal
PermissionsStartOnly=true
Environment=HOME=$USER_HOME
Environment=DISPLAY=:0
Environment=XDG_RUNTIME_DIR=/run/user/%U
Environment=ELECTRON_OZONE_PLATFORM_HINT=x11
Environment=LIBGL_ALWAYS_SOFTWARE=1
Environment=ELECTRON_DISABLE_GPU=1
ExecStartPre=/bin/sh -c 'if [ -w "$BACKLIGHT_PATH" ]; then cat "$BACKLIGHT_PATH" > /run/pphc-backlight-prev || true; echo 0 > "$BACKLIGHT_PATH" || true; fi'
ExecStart=/usr/bin/xinit $XSESSION_SCRIPT -- :0 -nolisten tcp vt1
ExecStartPost=/bin/sh -c 'if [ -w "$BACKLIGHT_PATH" ]; then sleep 8; if [ -s /run/pphc-backlight-prev ]; then cat /run/pphc-backlight-prev > "$BACKLIGHT_PATH" || true; else echo 200 > "$BACKLIGHT_PATH" || true; fi; fi'
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF

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
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl set-default multi-user.target

echo "Installed $SERVICE_NAME (production)."
echo "User: $USER_NAME"
echo "AppImage: $APP_IMAGE_PATH"
echo "Backlight path: $BACKLIGHT_PATH"
echo "Service: $SERVICE_PATH"
echo "Xsession: $XSESSION_SCRIPT"
