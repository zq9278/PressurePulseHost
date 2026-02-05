#!/usr/bin/env bash
set -euo pipefail

APP_ID="pressure-pulse-host-controller-electron"
APP_SETTINGS="${XDG_CONFIG_HOME:-$HOME/.config}/${APP_ID}/settings.json"
REPO_SETTINGS="${PWD}/settings.json"

print_kv() {
  local key="$1"
  local val="$2"
  printf "%-34s %s\n" "${key}:" "${val}"
}

gget() {
  local schema="$1"
  local key="$2"
  gsettings get "${schema}" "${key}" 2>/dev/null || echo "<unavailable>"
}

json_get() {
  local file="$1"
  local key="$2"
  python3 - "$file" "$key" <<'PY'
import json, sys, pathlib
path = pathlib.Path(sys.argv[1])
key = sys.argv[2]
if not path.exists():
    print("<missing>")
    raise SystemExit(0)
try:
    data = json.loads(path.read_text(encoding="utf-8"))
except Exception:
    print("<invalid-json>")
    raise SystemExit(0)
value = data.get(key, "<unset>")
print(value)
PY
}

echo "=== System UI / Color State Check ==="
print_kv "Time" "$(date '+%F %T %z')"
print_kv "Host" "$(hostname 2>/dev/null || echo '<unknown>')"
echo

echo "--- GNOME interface ---"
GTK_THEME="$(gget org.gnome.desktop.interface gtk-theme)"
ICON_THEME="$(gget org.gnome.desktop.interface icon-theme)"
COLOR_SCHEME="$(gget org.gnome.desktop.interface color-scheme)"
ACCENT_COLOR="$(gget org.gnome.desktop.interface accent-color)"
print_kv "GTK theme" "${GTK_THEME}"
print_kv "Icon theme" "${ICON_THEME}"
print_kv "Color scheme" "${COLOR_SCHEME}"
print_kv "Accent color" "${ACCENT_COLOR}"
echo

echo "--- GNOME color / background ---"
NL_ENABLED="$(gget org.gnome.settings-daemon.plugins.color night-light-enabled)"
NL_TEMP="$(gget org.gnome.settings-daemon.plugins.color night-light-temperature)"
BG_LIGHT="$(gget org.gnome.desktop.background picture-uri)"
BG_DARK="$(gget org.gnome.desktop.background picture-uri-dark)"
print_kv "Night light enabled" "${NL_ENABLED}"
print_kv "Night light temperature" "${NL_TEMP}"
print_kv "Wallpaper (light)" "${BG_LIGHT}"
print_kv "Wallpaper (dark)" "${BG_DARK}"
echo

echo "--- Electron app settings ---"
print_kv "App settings file" "${APP_SETTINGS}"
if [[ -f "${APP_SETTINGS}" ]]; then
  print_kv "Last modified" "$(stat -c '%y' "${APP_SETTINGS}" 2>/dev/null || echo '<unknown>')"
fi
print_kv "theme" "$(json_get "${APP_SETTINGS}" theme)"
print_kv "language" "$(json_get "${APP_SETTINGS}" language)"
print_kv "brightness" "$(json_get "${APP_SETTINGS}" brightness)"
print_kv "volume" "$(json_get "${APP_SETTINGS}" volume)"
print_kv "fontScale" "$(json_get "${APP_SETTINGS}" fontScale)"
print_kv "autoConnect" "$(json_get "${APP_SETTINGS}" autoConnect)"
echo

echo "--- Repo fallback settings (if used) ---"
print_kv "Repo settings file" "${REPO_SETTINGS}"
print_kv "theme" "$(json_get "${REPO_SETTINGS}" theme)"
print_kv "language" "$(json_get "${REPO_SETTINGS}" language)"
echo

echo "--- Quick diagnosis ---"
if [[ "${NL_ENABLED}" == "true" ]]; then
  echo "[WARN] Night Light is enabled. This can make the whole UI/yellower."
else
  echo "[OK] Night Light is disabled."
fi

if [[ "${GTK_THEME}" == "'Adwaita'" ]]; then
  echo "[INFO] GTK theme is Adwaita (system default)."
else
  echo "[INFO] GTK theme is ${GTK_THEME}."
fi

APP_THEME="$(json_get "${APP_SETTINGS}" theme)"
if [[ "${APP_THEME}" == "dark" ]]; then
  echo "[OK] Electron app theme is dark."
elif [[ "${APP_THEME}" == "light" ]]; then
  echo "[WARN] Electron app theme is light."
else
  echo "[INFO] Electron app theme is ${APP_THEME}."
fi

echo
echo "Done."
