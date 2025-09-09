@echo off
chcp 65001 >nul
title AI Exam Generator - Auto Installer
echo ========================================
echo     AI Exam Generator Auto Installer
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing automatically...
    echo.
    echo Downloading Node.js installer...
    
    REM Check if PowerShell is available for download
    powershell -Command "Get-Host" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Error: PowerShell is required for automatic installation.
        echo Please manually install Node.js from: https://nodejs.org/
        pause
        exit /b 1
    )
    
    REM Download and install Node.js
    echo Please wait while downloading Node.js...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'nodejs_installer.msi'}"
    
    if exist "nodejs_installer.msi" (
        echo Installing Node.js...
        echo This may take a few minutes and require administrator privileges.
        msiexec /i nodejs_installer.msi /quiet /norestart
        
        REM Wait for installation to complete
        timeout /t 30 /nobreak >nul
        
        REM Clean up installer
        del "nodejs_installer.msi" >nul 2>&1
        
        REM Refresh environment variables
        echo Refreshing environment variables...
        call :RefreshEnv
        
        REM Check if installation was successful
        node --version >nul 2>&1
        if %errorlevel% neq 0 (
            echo Installation failed or requires system restart.
            echo Please restart your computer and run this script again.
            pause
            exit /b 1
        )
        
        echo Node.js installation completed successfully!
    ) else (
        echo Failed to download Node.js installer.
        echo Please check your internet connection and try again.
        echo Or manually install from: https://nodejs.org/
        pause
        exit /b 1
    )
) else (
    echo Node.js is already installed.
)

echo.
echo [2/4] Verifying Node.js version...
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%

echo.
echo [3/4] Checking build files...
if not exist "dist" (
    echo Build files not found. Building project...
    
    REM Check if npm is available
    npm --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Error: npm is not available. Please restart your computer.
        pause
        exit /b 1
    )
    
    REM Install dependencies if needed
    if not exist "node_modules" (
        echo Installing project dependencies...
        npm install --silent
    )
    
    REM Build the project
    echo Building the project...
    npm run build --silent
    
    if not exist "dist" (
        echo Build failed. Please check for errors above.
        pause
        exit /b 1
    )
    
    echo Project built successfully!
) else (
    echo Build files found.
)

echo.
echo [4/4] Starting AI Exam Generator...
echo Server will start at http://localhost:3000
echo Browser will open automatically...
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Start the simple server
node simple-server.js

goto :eof

:RefreshEnv
REM Refresh environment variables without restarting
for /f "skip=2 tokens=2,*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set SysPath=%%B
for /f "skip=2 tokens=2,*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set UserPath=%%B
if defined UserPath (
    set "PATH=%SysPath%;%UserPath%"
) else (
    set "PATH=%SysPath%"
)
goto :eof