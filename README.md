# 📱 AttendanceApp-Hybrid

## 🎯 Project Overview

This is a **hybrid attendance tracking application** that combines the best of both worlds:

- **Android/APK Code**: From the `Attendi` repository (React Native mobile app)
- **Server & Admin Panel**: From the `attendy` project (Node.js backend + Electron admin panel)

## 📁 Project Structure

```
AttendanceApp-Hybrid/
├── 📱 MOBILE APP (from Attendi)
│   ├── android/                 # Android build configuration
│   ├── App.js                   # Main React Native app
│   ├── *.js                     # React Native components
│   ├── package.json             # Mobile app dependencies
│   └── BUILD_APK_FIXED.bat      # APK build script
│
├── 🖥️ SERVER (from attendy)
│   ├── server/                  # Server modules
│   ├── server.js                # Main server file
│   ├── models/                  # Database models
│   └── config.js                # Server configuration
│
├── 🎛️ ADMIN PANEL (from attendy)
│   ├── admin-panel/             # Electron admin interface
│   └── START_ADMIN_PANEL.bat    # Admin panel launcher
│
└── 📋 CONFIGURATION
    ├── .env                     # Environment variables
    ├── .env.example             # Environment template
    └── .github/                 # Deployment workflows
```

## 🚀 Key Features

### Mobile App (Android APK)
- **Face Verification**: Biometric attendance marking
- **WiFi-based Attendance**: BSSID validation for location verification
- **Real-time Timer**: Tracks student presence duration
- **Teacher Dashboard**: Manage students and attendance
- **Random Ring System**: Verify student presence during lectures
- **Offline Support**: Works without internet connection

### Server Backend
- **RESTful API**: Handles all mobile app requests
- **Real-time Updates**: Socket.IO for live data sync
- **MongoDB Integration**: Stores attendance, students, teachers data
- **Azure Deployment**: Cloud-hosted for scalability
- **Rate Limiting**: Prevents API abuse

### Admin Panel
- **Desktop Interface**: Electron-based management tool
- **Student Management**: Add, edit, view student records
- **Teacher Management**: Manage teacher accounts and permissions
- **Attendance Reports**: Generate and export attendance data
- **System Configuration**: Configure app settings and parameters

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# Install mobile app dependencies
npm install

# Install server dependencies (if separate)
cd server && npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# - MongoDB connection string
# - Azure server URL
# - API keys and secrets
```

### 3. Build Android APK
```bash
# Run the build script
BUILD_APK_FIXED.bat

# Or manually
cd android
gradlew assembleRelease
```

### 4. Start Server
```bash
# Start the Node.js server
node server.js

# Or use PM2 for production
pm2 start server.js
```

### 5. Launch Admin Panel
```bash
# Start the Electron admin panel
START_ADMIN_PANEL.bat
```

## 📱 Mobile App Components

### Core Components
- `App.js` - Main application entry point
- `FaceVerificationScreen.js` - Biometric verification
- `TeacherDashboard.js` - Teacher interface
- `StudentCard.js` - Student information display
- `CircularTimer.js` - Attendance timer

### WiFi & Location
- `WiFiManager.js` - WiFi network management
- `WiFiBSSIDService.js` - BSSID detection and validation
- `NativeWiFiService.js` - Native WiFi module integration

### Navigation & UI
- `BottomNavigation.js` - Tab navigation
- `TimetableScreen.js` - Class schedule display
- `CalendarScreen.js` - Calendar view
- `ProfileScreen.js` - User profile management

## 🖥️ Server Architecture

### API Endpoints
- `/api/attendance/*` - Attendance management
- `/api/students/*` - Student operations
- `/api/teachers/*` - Teacher operations
- `/api/timetable/*` - Schedule management
- `/api/face-verification/*` - Biometric verification

### Database Models
- `Student.js` - Student information and attendance
- `Teacher.js` - Teacher accounts and permissions
- `Attendance.js` - Attendance records
- `Timetable.js` - Class schedules

## 🎛️ Admin Panel Features

### Student Management
- Add new students (individual or bulk import)
- Edit student information
- View attendance history
- Generate student reports

### Teacher Management
- Create teacher accounts
- Assign permissions and roles
- Manage class assignments
- View teacher statistics

### System Administration
- Configure app settings
- Manage WiFi BSSID mappings
- Set up classroom configurations
- Monitor system health

## 🔧 Development Tools

### Build Scripts
- `BUILD_APK_FIXED.bat` - Build Android APK
- `START_ADMIN_PANEL.bat` - Launch admin panel
- `CHECK_DATABASE.bat` - Verify database connection
- `RESET_DATABASE.bat` - Reset database (development)

### Testing Scripts
- `test-server-direct.js` - Test server endpoints
- `test-teachers-api.js` - Test teacher API
- `reset-and-add-*.js` - Populate test data

## 🚀 Deployment

### Mobile App
1. Build APK using `BUILD_APK_FIXED.bat`
2. Distribute APK to devices
3. Install with `adb install -r app-release.apk`

### Server
1. Deploy to Azure App Service
2. Configure environment variables
3. Set up MongoDB connection
4. Enable CORS for mobile app

### Admin Panel
1. Package as Electron executable
2. Distribute to administrators
3. Configure server connection

## 🔐 Security Features

- **BSSID Validation**: Ensures students are physically present
- **Face Verification**: Biometric authentication
- **Rate Limiting**: Prevents API abuse
- **Permission System**: Role-based access control
- **Secure Communication**: HTTPS/WSS for all connections

## 📊 Monitoring & Analytics

- Real-time attendance tracking
- Student presence duration
- Teacher activity logs
- System performance metrics
- Attendance pattern analysis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review error logs
- Contact system administrator
- Submit GitHub issues

---

**Note**: This hybrid project combines mobile app code from Attendi repository with server/admin code from attendy project for a complete attendance tracking solution.