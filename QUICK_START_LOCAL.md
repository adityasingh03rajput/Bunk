# Quick Start - Local Development

## ✅ Configuration Complete

Your app is now configured for local development:
- **Server URL**: `http://192.168.55.31:3000`
- **Status**: Ready to build

## Before Building

### 1. Start Your Local Server
```bash
node server.js
```

### 2. Verify Server is Running
Open browser: `http://192.168.55.31:3000/api/health`
Should see: `{"status":"ok"}`

### 3. Check Firewall (if needed)
```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## Build APK

```bash
BUILD_APK_PROPER_SDK.bat
```

APK will be created: `app-release-latest.apk`

## Install on Device

```bash
adb install -r app-release-latest.apk
```

## Important Notes

✅ **Mobile device must be on same WiFi network as your computer**
✅ **Server must be running before using the app**
✅ **IP address: 192.168.55.31 (your current local IP)**

## If IP Changes

1. Get new IP: `ipconfig`
2. Update `config.js` line 14
3. Update `admin-panel/renderer.js` line 10
4. Rebuild app

## Switch to Production

Update `config.js`:
```javascript
export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';
```

Update `admin-panel/renderer.js`:
```javascript
let SERVER_URL = localStorage.getItem('serverUrl') || 'https://letsbunk-uw7g.onrender.com';
```

Rebuild app.

---

**Ready to build!** 🚀
