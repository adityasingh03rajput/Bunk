# 🌐 Localhost Configuration Complete

## Summary
All URLs and IP addresses have been changed to localhost for local development.

---

## Files Updated

### Main Application Files
1. ✅ **App.js** - Mobile app configuration
   - API_URL: `http://localhost:3000/api/config`
   - SOCKET_URL: `http://localhost:3000`

2. ✅ **config.js** - Shared configuration
   - SERVER_BASE_URL: `http://localhost:3000`

3. ✅ **admin-panel/renderer.js** - Admin panel
   - SERVER_URL: `http://localhost:3000`

4. ✅ **ViewRecords.js** - View records component
   - API endpoint: `http://localhost:3000/api/view-records/students`

### Test Files
5. ✅ **test-complete-flow.js** - Always localhost
6. ✅ **test-offline-sync.js** - Always localhost
7. ✅ **quick-test.js** - Always localhost
8. ✅ **fresh-start-setup.js** - Always localhost

### Environment Files
9. ✅ **.env** - Already configured for localhost
   - MONGODB_URI: `mongodb://localhost:27017/attendance_app`
   - PORT: `3000`

10. ✅ **.env.example** - Template with localhost

---

## Current Configuration

### Backend Server
- **URL**: `http://localhost:3000`
- **Port**: 3000
- **MongoDB**: `mongodb://localhost:27017/attendance_app`

### Admin Panel
- **URL**: `http://localhost:3001`
- **Port**: 3001
- **Backend**: `http://localhost:3000`

### Mobile App (Expo)
- **Metro Bundler**: `http://localhost:19000` (or 19001, 19002)
- **Backend API**: `http://localhost:3000`
- **Socket.IO**: `http://localhost:3000`

---

## Network Access

### From Same Computer
- Backend: `http://localhost:3000`
- Admin Panel: `http://localhost:3001`

### From Mobile Device (Same Network)
If you want to test on a physical mobile device:

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   # Example: 192.168.1.100
   ```

2. **Update App.js temporarily:**
   ```javascript
   const API_URL = 'http://YOUR_IP:3000/api/config';
   const SOCKET_URL = 'http://YOUR_IP:3000';
   ```

3. **Update server.js CORS:**
   ```javascript
   // Already configured to allow all origins in .env
   ALLOWED_ORIGINS=*
   ```

---

## Port Configuration

### Default Ports
- **Backend Server**: 3000
- **Admin Panel**: 3001
- **MongoDB**: 27017
- **Expo Metro**: 19000-19002

### Change Ports (if needed)

**Backend Server:**
Edit `.env`:
```env
PORT=3000
```

**Admin Panel:**
Edit `admin-panel/main.js`:
```javascript
mainWindow.loadURL('http://localhost:3001');
```

**MongoDB:**
Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/attendance_app
```

---

## Verification

### Check All URLs
Run this command to verify no remote URLs remain:
```bash
# Search for any remaining remote URLs
grep -r "onrender.com" --exclude-dir=node_modules .
grep -r "https://letsbunk" --exclude-dir=node_modules .
```

Should return: No results (all changed to localhost)

### Test Connections

**1. Backend Server:**
```bash
curl http://localhost:3000
# Should return: Server is running
```

**2. Admin Panel:**
Open browser: `http://localhost:3001`

**3. API Endpoint:**
```bash
curl http://localhost:3000/api/config/app
# Should return: JSON configuration
```

---

## Environment Variables

### Current .env Configuration
```env
# MongoDB Local Connection
MONGODB_URI=mongodb://localhost:27017/attendance_app

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=*
```

### For Production (Future)
When deploying to production, update:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## Troubleshooting

### Cannot Connect to Backend
1. **Check if server is running:**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **Check MongoDB is running:**
   ```bash
   mongod --version
   ```

3. **Check firewall:**
   - Allow port 3000 in Windows Firewall
   - Allow Node.js through firewall

### Mobile App Cannot Connect
1. **Use computer's IP instead of localhost**
2. **Ensure mobile device is on same WiFi**
3. **Check firewall allows incoming connections**

### Admin Panel Cannot Connect
1. **Check SERVER_URL in renderer.js**
2. **Clear localStorage:**
   ```javascript
   localStorage.removeItem('serverUrl');
   ```
3. **Restart admin panel**

---

## Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Backend API | http://localhost:3000 | 3000 |
| Admin Panel | http://localhost:3001 | 3001 |
| MongoDB | mongodb://localhost:27017 | 27017 |
| Expo Metro | http://localhost:19000 | 19000 |

---

## Files with URL Configuration

| File | Variable | Value |
|------|----------|-------|
| App.js | API_URL | http://localhost:3000/api/config |
| App.js | SOCKET_URL | http://localhost:3000 |
| config.js | SERVER_BASE_URL | http://localhost:3000 |
| admin-panel/renderer.js | SERVER_URL | http://localhost:3000 |
| .env | MONGODB_URI | mongodb://localhost:27017/attendance_app |
| ViewRecords.js | fetch URL | http://localhost:3000/api/... |

---

## Testing Checklist

- ✅ Backend server starts on port 3000
- ✅ Admin panel starts on port 3001
- ✅ MongoDB connects successfully
- ✅ Mobile app connects to backend
- ✅ Socket.IO connects successfully
- ✅ API endpoints respond correctly
- ✅ Photo upload works
- ✅ Attendance tracking works

---

## Next Steps

1. **Start all services:**
   ```bash
   START_ALL.bat
   ```

2. **Verify connections:**
   - Open http://localhost:3000 (should show "Server is running")
   - Open http://localhost:3001 (admin panel should load)

3. **Test functionality:**
   - Enroll a student
   - Upload a photo
   - Start attendance
   - View records

---

**Status**: ✅ COMPLETE - All URLs configured for localhost

**Date**: February 18, 2026

**Configuration**: Local development environment
