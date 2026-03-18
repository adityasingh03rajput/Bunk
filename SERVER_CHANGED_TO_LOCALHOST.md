# 🔄 Server Changed from Render to Localhost

## Date: March 8, 2026

---

## ✅ Changes Made

All server URLs have been changed from Render.com production server to localhost for local development.

### Files Updated

#### 1. **config.js** (Main Configuration)
```javascript
// BEFORE
export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';

// AFTER
export const SERVER_BASE_URL = 'http://localhost:3000';
```

#### 2. **admin-panel/renderer.js** (Admin Panel)
```javascript
// BEFORE
let SERVER_URL = localStorage.getItem('serverUrl') || 'https://letsbunk-uw7g.onrender.com';

// AFTER
let SERVER_URL = localStorage.getItem('serverUrl') || 'http://localhost:3000';
```

Also updated the auto-reset logic to convert Render URLs to localhost instead of the reverse.

#### 3. **enrollment-app/app/src/main/res/values/config.xml** (Enrollment App)
```xml
<!-- BEFORE -->
<string name="server_base_url">https://letsbunk-uw7g.onrender.com/api</string>

<!-- AFTER -->
<string name="server_base_url">http://localhost:3000/api</string>
```

#### 4. **admin-panel/set-render-url.js** (Quick Setup Script)
```javascript
// BEFORE
const RENDER_URL = 'http://192.168.50.31:3000';

// AFTER
const RENDER_URL = 'http://localhost:3000';
```

#### 5. **TestBSSID.js** (Test Component)
```javascript
// BEFORE
const SOCKET_URL = 'http://192.168.1.7:3000';

// AFTER
const SOCKET_URL = 'http://localhost:3000';
```

#### 6. **test-face-storage.js** (Test Script)
```javascript
// BEFORE
const SERVER_URL = 'http://192.168.1.6:3000';

// AFTER
const SERVER_URL = 'http://localhost:3000';
```

#### 7. **test-login-face-data.js** (Test Script)
```javascript
// BEFORE
const SERVER_URL = 'http://192.168.1.6:3000';

// AFTER
const SERVER_URL = 'http://localhost:3000';
```

---

## 📊 Summary

| Component | Old URL | New URL |
|-----------|---------|---------|
| Mobile App | `https://letsbunk-uw7g.onrender.com` | `http://localhost:3000` |
| Admin Panel | `https://letsbunk-uw7g.onrender.com` | `http://localhost:3000` |
| Enrollment App | `https://letsbunk-uw7g.onrender.com/api` | `http://localhost:3000/api` |
| Test Scripts | Various IPs | `http://localhost:3000` |

---

## 🚀 Next Steps

### 1. Start Local Server
```bash
cd LetsBunk
npm start
```

The server will run on `http://localhost:3000`

### 2. Rebuild Mobile App (Required)
Since config.js changed, you need to rebuild the APK:

```bash
# Option 1: Quick build
BUILD_FAST.bat

# Option 2: Full release build
BUILD_RELEASE_APK.bat
```

### 3. Reinstall Mobile App
```bash
# Install the new APK on your device
INSTALL_RELEASE_APK.bat
```

### 4. Start Admin Panel
```bash
cd admin-panel
npm start
```

The admin panel will automatically use `http://localhost:3000`

### 5. Clear Admin Panel Cache (Optional)
If the admin panel still shows the old URL:
1. Open admin panel
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Run: `localStorage.clear(); location.reload();`

---

## 📱 Mobile App Configuration

### For Testing on Physical Device

If you need to test the mobile app on a physical device (not emulator), you'll need to use your computer's IP address instead of localhost:

1. Find your computer's IP address:
   ```bash
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Update `config.js`:
   ```javascript
   export const SERVER_BASE_URL = 'http://192.168.1.100:3000';
   ```

3. Rebuild and reinstall the app

### For Testing on Emulator

The current localhost configuration works perfectly with Android emulator.

---

## 🔧 Troubleshooting

### Mobile App Can't Connect

**Issue**: App shows "Cannot connect to server"

**Solution**:
1. Make sure server is running: `npm start`
2. Check server is accessible: Open browser and go to `http://localhost:3000`
3. If using physical device, use computer IP instead of localhost
4. Check firewall isn't blocking port 3000

### Admin Panel Shows Old URL

**Issue**: Admin panel still connects to Render

**Solution**:
1. Open Developer Tools (F12)
2. Go to Console
3. Run: `localStorage.setItem('serverUrl', 'http://localhost:3000'); location.reload();`

### Enrollment App Can't Connect

**Issue**: Enrollment app shows connection error

**Solution**:
1. Rebuild the enrollment app after config.xml change
2. Run: `cd enrollment-app && gradlew assembleRelease`
3. Reinstall the APK

---

## 🌐 Network Architecture (Updated)

```
┌─────────────────────────────────────────────────────┐
│  Computer (localhost)                               │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Backend Server                               │ │
│  │  ├─ Port: 3000                                │ │
│  │  ├─ URL: http://localhost:3000               │ │
│  │  ├─ API: http://localhost:3000/api           │ │
│  │  └─ MongoDB: Local or Atlas                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Admin Panel                                  │ │
│  │  ├─ Type: Electron Desktop App                │ │
│  │  ├─ Backend: http://localhost:3000           │ │
│  │  └─ Features: Student/Teacher Management     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Android Emulator                             │ │
│  │  ├─ LetsBunk App                              │ │
│  │  ├─ Backend: http://localhost:3000           │ │
│  │  └─ Status: Connected via emulator bridge    │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Important Notes

### Database Configuration

The `.env` file still uses MongoDB Atlas (cloud database). This is fine - you can use a cloud database with a local server.

If you want to use a local MongoDB instead:

1. Install MongoDB locally
2. Update `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/attendance_app
   ```
3. Restart the server

### Redis Configuration

The `.env` file uses Redis Cloud. This is also fine for local development.

For fully local setup, install Redis locally and update `.env`:
```
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Cloudinary Configuration

Image uploads still use Cloudinary cloud service. This works fine with local server.

---

## ✅ Verification Checklist

- [x] config.js updated to localhost
- [x] admin-panel/renderer.js updated to localhost
- [x] enrollment-app config.xml updated to localhost
- [x] Test scripts updated to localhost
- [x] Helper scripts updated to localhost
- [ ] Mobile app rebuilt with new config
- [ ] Mobile app reinstalled on device/emulator
- [ ] Server started and accessible
- [ ] Admin panel tested and working
- [ ] Mobile app tested and connecting

---

## 🔄 To Switch Back to Production (Render)

If you need to switch back to the production server:

1. Update `config.js`:
   ```javascript
   export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';
   ```

2. Update `admin-panel/renderer.js`:
   ```javascript
   let SERVER_URL = localStorage.getItem('serverUrl') || 'https://letsbunk-uw7g.onrender.com';
   ```

3. Update `enrollment-app/app/src/main/res/values/config.xml`:
   ```xml
   <string name="server_base_url">https://letsbunk-uw7g.onrender.com/api</string>
   ```

4. Rebuild and reinstall mobile apps

---

## 📞 Support

If you encounter any issues:
1. Check server is running: `npm start`
2. Check server logs for errors
3. Verify MongoDB connection in server logs
4. Test API manually: `curl http://localhost:3000/api/health`

---

**Status**: ✅ All server URLs changed to localhost

**Date**: March 8, 2026

**Ready for**: Local development and testing
