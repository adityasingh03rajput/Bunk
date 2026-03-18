# 🚀 LetsBunk - Quick Start Guide

## What Changed?

Face verification has been removed! The app now uses simple photo upload without AI processing.

---

## Prerequisites

1. **MongoDB** - Must be running locally
2. **Node.js** - Already installed
3. **Dependencies** - Already installed

---

## Start the Application

### Option 1: Start Everything (Recommended)

```bash
# Run this command in the LetsBunk directory
START_ALL.bat
```

This will start:
- MongoDB (if not running)
- Backend server (port 3000)
- Admin panel (port 3001)

### Option 2: Start Manually

**Terminal 1 - Backend Server:**
```bash
cd LetsBunk
npm start
```

**Terminal 2 - Admin Panel:**
```bash
cd LetsBunk/admin-panel
npm start
```

**Terminal 3 - Mobile App (Optional):**
```bash
cd LetsBunk
npx expo start
```

---

## Access the Application

### Admin Panel
- URL: http://localhost:3001
- Use this to:
  - Enroll students
  - Upload photos (no face detection)
  - Manage timetables
  - View attendance records

### Mobile App
- Scan QR code from Expo
- Or use Expo Go app
- Students can start attendance directly (no face verification)

### Backend API
- URL: http://localhost:3000
- MongoDB: mongodb://localhost:27017/attendance_app

---

## Key Features

### ✅ What Works
- Simple photo upload (camera or file)
- Direct attendance start (no verification)
- WiFi BSSID location verification
- Real-time attendance tracking
- Timetable management
- Student/teacher management
- Attendance reports

### ❌ What's Removed
- Face verification
- AI face detection
- Face-api.js models
- TensorFlow.js processing

---

## Common Tasks

### Enroll a Student
1. Open admin panel (http://localhost:3001)
2. Go to "Enroll Student"
3. Fill in details
4. Upload photo (any photo, no face detection)
5. Save

### Start Attendance (Student)
1. Open mobile app
2. Login with enrollment number
3. Click "Start Attendance"
4. That's it! No face verification needed

### Upload Teacher Photo
1. Open admin panel
2. Go to "Manage Teachers"
3. Select teacher
4. Upload photo
5. Save

---

## Troubleshooting

### Server won't start
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB if needed
mongod
```

### Port already in use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies missing
```bash
cd LetsBunk
npm install

cd admin-panel
npm install
```

---

## File Structure

```
LetsBunk/
├── App.js                 # Mobile app (React Native)
├── server.js              # Backend server (Express)
├── admin-panel/           # Admin panel (Electron)
├── package.json           # Dependencies
├── .env                   # Configuration
└── START_ALL.bat          # Quick start script
```

---

## Configuration

### MongoDB Connection
Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/attendance_app
```

### Server Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## Documentation

- `FACE_API_COMPLETE_REMOVAL_SUMMARY.md` - Complete removal details
- `FACE_API_REMOVAL_COMPLETE.md` - What was removed
- `QUICK_START_GUIDE.md` - Detailed setup guide
- `README_SETUP_COMPLETE.md` - Setup overview

---

## Support

If you need help:
1. Check server logs for errors
2. Verify MongoDB is running
3. Ensure ports 3000 and 3001 are free
4. Review documentation files

---

## Next Steps

1. ✅ Start the application
2. ✅ Enroll some students
3. ✅ Upload photos
4. ✅ Test attendance tracking
5. ✅ Explore admin panel features

---

**Status**: Ready to use! Face verification removed, simple photo upload enabled.

**Last Updated**: February 18, 2026
