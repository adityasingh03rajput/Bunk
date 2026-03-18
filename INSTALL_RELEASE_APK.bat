@echo off
echo ========================================
echo Installing LetsBunk Release APK
echo ========================================
echo.

if not defined ANDROID_HOME (
    set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
)
set ADB=%ANDROID_HOME%\platform-tools\adb.exe

echo Checking for connected devices...
"%ADB%" devices

echo.
echo Installing APK...
"%ADB%" install -r LetsBunk-Release.apk

echo.
echo ========================================
echo INSTALLATION COMPLETE!
echo ========================================
echo.
echo You can now open LetsBunk app on your device.
echo No Metro bundler needed!
echo.
pause
