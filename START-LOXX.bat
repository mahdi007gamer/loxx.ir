@echo off
setlocal EnableExtensions
chcp 65001 >nul
title LOXX - Local Studio Launcher
cd /d "%~dp0"
echo =====================================================
echo  LOXX Digital Product Studio - Local Launcher
echo =====================================================
echo.
where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git is required. Install: https://git-scm.com/download/win
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js 22 LTS or newer is required: https://nodejs.org
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0]) < 22) process.exit(1)"
if errorlevel 1 (
  echo [ERROR] Please install Node.js 22 LTS or newer.
  pause
  exit /b 1
)
set "PROJECT=%~dp0loxx.ir"
if not exist "%PROJECT%\.git" (
  echo [1/4] Cloning GitHub repository...
  git clone https://github.com/mahdi007gamer/loxx.ir.git "%PROJECT%"
  if errorlevel 1 goto FAIL
) else (
  echo [1/4] Checking existing local repository...
  cd /d "%PROJECT%"
  git diff --quiet
  if errorlevel 1 (
    echo [WARN] Local source changes detected. Git pull skipped to preserve your work.
  ) else (
    git diff --cached --quiet
    if errorlevel 1 (
      echo [WARN] Staged changes detected. Git pull skipped to preserve your work.
    ) else (
      git pull --ff-only
      if errorlevel 1 echo [WARN] Git update failed. Existing files will be used.
    )
  )
)
cd /d "%PROJECT%"
echo [2/4] Installing dependencies...
call npm install --no-audit --no-fund
if errorlevel 1 goto FAIL
echo [3/4] Preparing local database and accounts...
call npm run setup:local
if errorlevel 1 goto FAIL
echo [4/4] Starting website and API...
echo Website: http://localhost:3000
echo API:     http://localhost:4100/api/health
echo Admin password file: %PROJECT%\LOCAL_LOGIN.txt
echo Stop: Ctrl + C
echo.
start "" "http://localhost:3000"
call npm run dev
if errorlevel 1 goto FAIL
exit /b 0
:FAIL
echo.
echo [ERROR] Setup failed. Please copy the error output when reporting.
pause
exit /b 1
