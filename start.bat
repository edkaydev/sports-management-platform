@echo off
REM UMU Sports - Local one-click launcher (Windows).
REM Starts Docker if needed, starts the stack, applies migrations, seeds the
REM tutor account, and opens the browser.
setlocal
cd /d "%~dp0"

echo ==^> Checking Docker...

REM If Docker is not responding, try to open Docker Desktop and wait for it.
docker info >nul 2>&1
if errorlevel 1 (
  echo Docker is not running. Starting Docker Desktop...
  if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    start "" "%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
  ) else if exist "%LocalAppData%\Docker\Docker Desktop.exe" (
    start "" "%LocalAppData%\Docker\Docker Desktop.exe"
  ) else (
    echo Docker Desktop could not be found. Please open it yourself and wait
    echo until the whale icon stops animating, then run this file again.
    pause
    exit /b 1
  )

  echo Waiting for Docker to start (this can take a minute or two)...
  set /a dockertries=0
  :waitdocker
  set /a dockertries+=1
  if %dockertries% gtr 90 (
    echo Docker did not start. Please open Docker Desktop manually, then run start.bat again.
    pause
    exit /b 1
  )
  docker info >nul 2>&1
  if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto waitdocker
  )
  echo Docker is now running.
)

echo ==^> Starting database...
docker compose up -d db

echo ==^> Waiting for database health...
set /a tries=0
:waitloop
set /a tries+=1
if %tries% gtr 60 (
  echo Database failed to become healthy. Check "docker compose logs db".
  pause
  exit /b 1
)
for /f %%i in ('docker compose ps -q db 2^>nul') do set DBID=%%i
if not defined DBID (
  timeout /t 2 /nobreak >nul
  goto waitloop
)
set HEALTH=starting
for /f "tokens=*" %%s in ('docker inspect --format={{.State.Health.Status}} %DBID%') do set HEALTH=%%s
if /i not "%HEALTH%"=="healthy" (
  timeout /t 2 /nobreak >nul
  goto waitloop
)

echo ==^> Starting API and app...
docker compose up -d api client

echo ==^> Making sure the database is up to date...
docker compose exec -T api npx prisma migrate deploy
docker compose exec -T api npx prisma db seed

echo.
echo ===================================================
echo   UMU Sports is running.
echo.
echo   Sign in with:
echo     Username: tutor
echo     Password: Tutor@2025
echo   (You will be asked to set a new password the first time.)
echo ===================================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:5173

echo Close this window whenever you like. The app keeps running.
echo.
pause