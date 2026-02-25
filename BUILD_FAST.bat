@echo off
echo ========================================
echo Fast Build - Using Gradle Cache
echo ========================================
echo.
echo This build skips 'clean' for faster compilation
echo Use BUILD_RELEASE_APK.bat for a clean build
echo.

cd android

echo [1/2] Building release APK (incremental)...
call gradlew assembleRelease --build-cache --parallel

echo.
echo [2/2] Copying APK to main folder...
cd ..
copy "android\app\build\outputs\apk\release\app-release.apk" "LetsBunk-Release.apk" /Y

echo.
echo ========================================
echo FAST BUILD COMPLETE!
echo ========================================
echo.
echo APK Location: LetsBunk-Release.apk
echo.
echo To install on device:
echo adb install -r LetsBunk-Release.apk
echo.
pause
