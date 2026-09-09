#!/bin/bash
# UMU Sports — Kiosk mode (macOS).
# Opens the system in a clean, full-screen window with no address bar or browser
# chrome, so the tutor's machine only shows this system.
set -e

cd "$(dirname "$0")"

URL="http://localhost:5173"

echo "==> Opening UMU Sports in kiosk / full-screen mode..."

if [ -d "/Applications/Google Chrome.app" ]; then
  echo "(Google Chrome — kiosk window)"
  open -na "Google Chrome" --args --kiosk --no-first-run --disable-session-crashed-bubble "$URL"
  echo "Kiosk window opened. Press Cmd+Shift+W or Esc (if shown) to exit full screen."
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  echo "(Microsoft Edge — kiosk window)"
  open -na "Microsoft Edge" --args --kiosk --no-first-run "$URL"
  echo "Kiosk window opened."
else
  echo "(Default browser — opening full screen)"
  open "$URL"
  osascript -e 'tell application "System Events"
    try
      set frontApp to name of first application process whose frontmost is true
      tell process frontApp to keystroke "f" using {command down, control down}
    end try
  end tell'
fi

echo ""
echo "Tip: to start this automatically every time the computer turns on,"
echo "add start.command AND this script to System Settings > General > Login Items."
echo ""

read -r -p "Press Enter to close this window (the app keeps running)." _