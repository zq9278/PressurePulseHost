#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_SRC="${SCRIPT_DIR}/99-backlight-spi.rules"
RULES_DST="/etc/udev/rules.d/99-backlight-spi.rules"

if [[ ! -f "${RULES_SRC}" ]]; then
  echo "[install-udev] Missing rules file: ${RULES_SRC}"
  exit 1
fi

run_root() {
  if [[ "${EUID}" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    echo "[install-udev] Need root privileges. Re-run as root or install sudo."
    exit 1
  fi
}

echo "[install-udev] Installing udev rules to ${RULES_DST}"
run_root cp "${RULES_SRC}" "${RULES_DST}"
run_root udevadm control --reload-rules
run_root udevadm trigger --subsystem-match=backlight --action=add
run_root udevadm trigger --subsystem-match=spidev --action=add

echo "[install-udev] Done. Verify with:"
echo "  ls -l /sys/class/backlight/backlight2/brightness /sys/class/backlight/backlight2/max_brightness /dev/spidev0.0"
