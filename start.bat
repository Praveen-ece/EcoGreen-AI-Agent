@echo off
title EcoPick Launcher
echo.
echo  ==========================================
echo   EcoPick - AI Sustainability Agent
echo  ==========================================
echo.

REM Get the directory where this bat file lives
set ROOT=%~dp0

REM Check backend .env has a key
findstr /C:"GEMINI_API_KEY=" "%ROOT%backend\.env" >nul 2>&1
if errorlevel 1 (
    echo  [WARNING] backend\.env not found. Please create it first.
    pause
    exit /b 1
)

echo  Starting Backend on http://localhost:5000 ...
start "EcoPick Backend" cmd /k "cd /d %ROOT%backend && npm run dev"

REM Small delay so backend starts first
timeout /t 2 /nobreak >nul

echo  Starting Frontend on http://localhost:5173 ...
start "EcoPick Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

REM Wait a moment then open browser
timeout /t 4 /nobreak >nul
echo.
echo  Opening http://localhost:5173 in browser...
start "" "http://localhost:5173"

echo.
echo  Both servers are running.
echo  Backend  -^>  http://localhost:5000
echo  Frontend -^>  http://localhost:5173
echo.
echo  Close the Backend and Frontend windows to stop the servers.
echo.
pause
