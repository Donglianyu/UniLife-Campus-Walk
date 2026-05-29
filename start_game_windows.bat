@echo off
cd /d "%~dp0backend"
set PORT=3002

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Please install Node.js first, then run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies for the first run...
  npm install
  if errorlevel 1 (
    echo npm install failed. Please check your network or Node.js installation.
    pause
    exit /b 1
  )
)

start "" cmd /c "timeout /t 2 >nul & start http://127.0.0.1:3002/"
echo Starting UniLife Campus Walk...
echo Local URL: http://127.0.0.1:3002/
echo LAN URL:   http://10.253.36.14:3002/
echo Keep this window open while playing.
npm start
