# 🚀 Quick Start Guide - LetsBunk

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [x] **Node.js** installed (v16 or higher)
- [x] **npm** installed (comes with Node.js)
- [ ] **MongoDB** installed and running
- [x] **Dependencies** installed (completed!)

## 📋 Installation Status

✅ **Main Project Dependencies**: 1,370 packages installed  
✅ **Admin Panel Dependencies**: 313 packages installed  
✅ **Configuration Files**: Created (.env)  
⚠️ **MongoDB**: Needs to be installed and started

---

## 🎯 Three Ways to Start

### Option 1: Automated Start (Recommended)

**Start Everything with One Click:**

```bash
# Double-click this file:
START_ALL.bat
```

This will:
1. Check and start MongoDB
2. Verify dependencies
3. Check configuration
4. Start the backend server

**Start Admin Panel:**

```bash
# Double-click this file:
START_ADMIN_PANEL.bat
```

### Option 2: Manual Start (Step by Step)

**Step 1: Start MongoDB**
```bash
net start MongoDB
```

**Step 2: Start Backend Server**
```bash
cd LetsBunk
npm start
```

**Step 3: Start Admin Panel** (in new terminal)
```bash
cd LetsBunk/admin-panel
npm start
```

### Option 3: Development Mode (with auto-reload)

**Start Server with Nodemon:**
```bash
cd LetsBunk
npm run dev
```

---

## 🗄️ MongoDB Setup (If Not Installed)

### Quick Install with Chocolatey:
```powershell
# Run PowerShell as Administrator
choco install mongodb

# Start MongoDB
net start MongoDB
```

### Manual Install:
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service: `net start MongoDB`

**Full guide**: See `SETUP_LOCAL_MONGODB.md`

---

## 🧪 Verify Installation

### Test 1: Check MongoDB Connection
```bash
mongosh
# or
mongo
```

### Test 2: Test Server
```bash
cd LetsBunk
node quick-test.js
```

### Test 3: Check Database
```bash
cd LetsBunk
node CHECK_DATABASE.bat
```

---

## 🌐 Access Points

Once everything is running:

| Component | URL | Description |
|-----------|-----|-------------|
| **Backend API** | http://localhost:3000 | Server API endpoints |
| **Admin Panel** | Electron App | Desktop application |
| **MongoDB** | mongodb://localhost:27017 | Database connection |
| **API Health** | http://localhost:3000/api/health | Server health check |
| **API Config** | http://localhost:3000/api/config | App configuration |

---

## 📱 Mobile App Setup

### For Android:

**Option 1: Build APK**
```bash
cd LetsBunk
BUILD_APK_PROPER_SDK.bat
```

**Option 2: Run on Device/Emulator**
```bash
npm run android
```

### For iOS (Mac only):
```bash
npm run ios
```

---

## 🎮 Using the Admin Panel

### First Time Setup:

1. **Launch Admin Panel**: Run `START_ADMIN_PANEL.bat`
2. **Check Server Connection**: Look for green "Connected" status
3. **Add Students**: Click "Students" → "Add Student"
4. **Add Teachers**: Click "Teachers" → "Add Teacher"
5. **Create Timetable**: Click "Timetable" → Select semester/branch
6. **Add Subjects**: Click "Subjects" → "Add Subject"

### Default Admin Login:
- **ID**: ADMIN001
- **Password**: admin123

(Created automatically by `fresh-start-setup.js`)

---

## 🔧 Common Commands

### Server Commands:
```bash
npm start              # Start server
npm run dev            # Start with auto-reload
node server.js         # Direct start
```

### Admin Panel Commands:
```bash
npm start              # Start Electron app
npm run build          # Build installer
npm run build-installer # Build Windows installer
```

### Database Commands:
```bash
net start MongoDB      # Start MongoDB
net stop MongoDB       # Stop MongoDB
mongosh                # Open MongoDB shell
```

### Testing Commands:
```bash
node quick-test.js                    # Quick API test
node test-complete-flow.js --local    # Full flow test
node test-dependencies.js             # Check dependencies
```

---

## 🐛 Troubleshooting

### Server won't start?
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F
```

### MongoDB connection error?
```bash
# Check MongoDB status
sc query MongoDB

# Restart MongoDB
net stop MongoDB
net start MongoDB
```

### Admin Panel won't launch?
```bash
cd admin-panel
npm rebuild electron
npm start
```

### Dependencies issues?
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Project Structure

```
LetsBunk/
├── 📱 Mobile App
│   ├── App.js                    # Main app entry
│   ├── server.js                 # Backend server
│   └── node_modules/             # 1,370 packages ✅
│
├── 🎛️ Admin Panel
│   ├── admin-panel/
│   │   ├── index.html            # Admin UI
│   │   ├── main.js               # Electron main
│   │   └── node_modules/         # 313 packages ✅
│
├── 🗄️ Database
│   └── MongoDB (localhost:27017)
│
└── 📝 Configuration
    ├── .env                      # Local config ✅
    ├── package.json              # Dependencies ✅
    └── SETUP_LOCAL_MONGODB.md    # DB setup guide
```

---

## 🎯 Next Steps

1. ✅ Dependencies installed
2. ⚠️ Install MongoDB (if not done)
3. ⚠️ Start MongoDB service
4. ⚠️ Run `START_ALL.bat`
5. ⚠️ Run `START_ADMIN_PANEL.bat`
6. ⚠️ Add students and teachers
7. ⚠️ Create timetable
8. ⚠️ Test mobile app

---

## 📚 Additional Resources

- **Full Setup**: `SETUP_LOCAL_MONGODB.md`
- **Installation Details**: `INSTALLATION_COMPLETE.md`
- **Project Documentation**: `README.md`
- **Tech Stack**: `TECH_STACK_DOCUMENTATION.md`

---

## 🆘 Need Help?

### Check Logs:
- Server logs: Console output
- MongoDB logs: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
- Admin Panel: Press F12 for DevTools

### Common Issues:
1. **Port 3000 in use**: Change PORT in `.env`
2. **MongoDB not found**: Install MongoDB first
3. **Dependencies missing**: Run `npm install`
4. **Permission errors**: Run as Administrator

---

**You're all set! 🎉**

Run `START_ALL.bat` to begin using LetsBunk!
