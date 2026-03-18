# APK Installation Guide

## The Issue
The error `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user` means you need to accept the installation prompt on your phone.

## Solution: Install via ADB (Recommended)

### Step 1: Run the install command
```bash
adb install -r LetsBunk-Release.apk
```

### Step 2: Check your phone screen
When you run the command, a prompt will appear on your phone asking:
- "Do you want to install this application?"
- "Install anyway?" or similar message

### Step 3: Accept the prompt
- **Tap "Install"** or **"OK"** on your phone
- Do this quickly (within a few seconds)

### Step 4: Wait for completion
The installation will complete and you'll see:
```
Success
```

## Alternative: Manual Installation

If ADB keeps failing, install manually:

### Step 1: Transfer APK to phone
```bash
adb push LetsBunk-Release.apk /sdcard/Download/
```

### Step 2: On your phone
1. Open **File Manager** or **Downloads** app
2. Find `LetsBunk-Release.apk`
3. Tap on it
4. If prompted, enable "Install from unknown sources"
5. Tap **Install**
6. Wait for installation to complete

## Troubleshooting

### If "Install from unknown sources" is disabled:
1. Go to **Settings** → **Security** or **Privacy**
2. Enable **"Unknown sources"** or **"Install unknown apps"**
3. Select your file manager app
4. Enable installation permission

### If installation keeps failing:
1. Uninstall the old version first:
   ```bash
   adb uninstall com.countdowntimer.app
   ```
2. Then install the new version:
   ```bash
   adb install LetsBunk-Release.apk
   ```

## Quick Command Reference

```bash
# Install (replace existing)
adb install -r LetsBunk-Release.apk

# Uninstall first, then install
adb uninstall com.countdowntimer.app
adb install LetsBunk-Release.apk

# Transfer to phone for manual install
adb push LetsBunk-Release.apk /sdcard/Download/

# Check if device is connected
adb devices

# Launch app after installation
adb shell am start -n com.countdowntimer.app/.MainActivity
```

## What to Expect After Installation

Once installed, the app will show:
- ✅ Circular timer with colored subject segments
- ✅ Drag around the circle to see subject details
- ✅ Long press center to trigger face verification
- ✅ Period-based attendance system active

## Ready to Install?

Run this command and **watch your phone screen**:
```bash
adb install -r LetsBunk-Release.apk
```

Then **immediately tap "Install" or "OK"** on your phone when the prompt appears!
