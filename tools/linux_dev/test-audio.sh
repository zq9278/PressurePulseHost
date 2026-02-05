#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_WAV="${ROOT_DIR}/resoure/Treatment-start.wav"

echo "[test-audio] ensure mixer switches on"
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

if command -v speaker-test >/dev/null 2>&1; then
  echo "[test-audio] speaker-test 1kHz tone (1 loop)"
  speaker-test -c 2 -t sine -f 1000 -l 1
else
  echo "[test-audio] speaker-test not found"
fi

if command -v aplay >/dev/null 2>&1 && [[ -f "${TEST_WAV}" ]]; then
  echo "[test-audio] aplay ${TEST_WAV}"
  aplay -D default -c 2 "${TEST_WAV}"
else
  echo "[test-audio] aplay not found or missing ${TEST_WAV}"
fi
