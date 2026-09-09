@echo off
REM UMU Sports - Kiosk mode (Windows).
REM Opens the system in a clean, full-screen window with no address bar or browser
REM chrome, so the tutor's machine only shows this system.
setlocal
cd /d "%~dp0"

set "URL=http://localhost:5173"

REM Microsoft Edge (ships with Windows, best kiosk support)
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk --no-first-run --disable-session-crashed-bubble "%URL%"
  echo Kiosk window opened. Full-screen; press Shift+Tab then type ESC, or close Edge to exit.
  goto :done
)
set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk --no-first-run --disable-session-crashed-bubble "%URL%"
  echo Kiosk window opened. Full-screen; press Shift+Tab then type ESC, or close Edge to exit.
  goto :done
)

REM Google Chrome
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk --no-first-run --disable-session-crashed-bubble "%URL%"
  echo Kiosk window opened. Press Alt+F4 to exit full screen.
  goto :done
)
set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk --no-first-run --disable-session-crashed-bubble "%URL%"
  echo Kiosk window opened. Press Alt+F4 to exit full screen.
  goto :done
)

REM Fallback: default browser
start "" "%URL%"
echo Could not find Edge or Chrome - opened in the default browser.

:done
echo.
echo Tip: to start automatically every time the PC turns on, put shortcuts to
echo start.bat and this script (kiosk.bat) in Startup (Win+R: shell:startup).
echo.
pause