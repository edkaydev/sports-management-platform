@echo off
REM UMU Sports - stop the local stack and keep all data (Windows).
cd /d "%~dp0"
docker compose down
echo Stopped. Your data is kept in the mysql_data volume.
pause