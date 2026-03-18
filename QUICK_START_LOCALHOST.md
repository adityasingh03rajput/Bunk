# 🚀 Quick Start - Localhost Configuration

## Server is now configured for localhost!

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start the Server
```bash
cd LetsBunk
npm start
```

Server will run on: `http://localhost:3000`

### 2️⃣ Start Admin Panel
```bash
cd LetsBunk/admin-panel
npm start
```

Or double-click: `START_ADMIN_PANEL.bat`

### 3️⃣ Rebuild Mobile App (First Time Only)
```bash
cd LetsBunk
BUILD_RELEASE_APK.bat
```

Then install: `INSTALL_RELEASE_APK.bat`

---

## ✅ What's Configured

All components now use `http://localhost:3000`:

- ✅ Mobile App (config.js)
- ✅ Admin Panel (renderer.js)
- ✅ Enrollment App (config.xml)
- ✅ All test scripts

---

## 📱 Testing on Physical Device?

If you need to test on a real phone (not emulator):

1. Find your computer's IP:
   ```bash
   ipconfig
   # Look for IPv4 (e.g., 192.168.1.100)
   ```

2. Update `config.js`:
   ```javascript
   export const SERVER_BASE_URL = 'http://192.168.1.100:3000';
   ```

3. Rebuild app: `BUILD_RELEASE_APK.bat`

4. Reinstall: `INSTALL_RELEASE_APK.bat`

---

## 🔧 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID> /F
```

### Admin Panel shows old URL
Open Developer Tools (F12) and run:
```javascript
localStorage.setItem('serverUrl', 'http://localhost:3000');
location.reload();
```

### Mobile App can't connect
1. Make sure server is running
2. Test in browser: `http://localhost:3000`
3. If using physical device, use computer IP instead of localhost
4. Check Windows Firewall isn't blocking port 3000

---

## 📊 System Status

Check if everything is working:

1. **Server**: Open `http://localhost:3000` in browser
2. **API**: Open `http://localhost:3000/api/health`
3. **Admin Panel**: Should show "Connected" status
4. **Mobile App**: Should connect and load data

---

## 🎯 Common Tasks

### Add a Student
1. Open Admin Panel
2. Click "Enroll Student"
3. Fill details and upload photo
4. Save

### View Attendance
1. Open Admin Panel
2. Click "View Records"
3. Select filters
4. View reports

### Test Mobile App
1. Open app on emulator/device
2. Login with student credentials
3. Check if timetable loads
4. Test attendance marking

---

## 📝 Files Changed

- `config.js` → localhost
- `admin-panel/renderer.js` → localhost
- `enrollment-app/.../config.xml` → localhost
- Test scripts → localhost

See `SERVER_CHANGED_TO_LOCALHOST.md` for full details.

---

## 🔄 Need Production Server?

To switch back to Render.com:

1. Update `config.js`:
   ```javascript
   export const SERVER_BASE_URL = 'https://letsbunk-uw7g.onrender.com';
   ```

2. Rebuild mobile app

3. Admin panel will auto-update (or clear localStorage)

---

**Ready to go!** Start the server and admin panel, then test the system.
