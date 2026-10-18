@echo off
setlocal
cd /d "%~dp0"
echo KHAJI v3 - install user-owned fonts from assets.zip
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install_fonts.ps1"
if errorlevel 1 (
  echo.
  echo Please place your original assets.zip next to this project folder and run again.
  pause
  exit /b 1
)
echo Opening preview in your default browser...
start "" "%~dp0preview\index.html"
