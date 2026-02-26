@echo off
REM Database Backup Script for Windows
REM This script creates a backup of the MongoDB database

echo ========================================
echo MongoDB Database Backup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if scripts directory exists
if not exist "scripts\backup-database.js" (
    echo ERROR: Backup script not found
    echo Expected location: scripts\backup-database.js
    pause
    exit /b 1
)

REM Run the backup script
echo Starting backup...
echo.
node scripts\backup-database.js

REM Check if backup was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Backup completed successfully!
    echo ========================================
    echo.
    echo Backup location: backups\
    echo.
    echo To restore from this backup, run:
    echo   node scripts\restore-database.js [backup-folder-name]
    echo.
) else (
    echo.
    echo ========================================
    echo Backup FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
