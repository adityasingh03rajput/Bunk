# 📚 Tech Stack Documentation - AttendanceApp Hybrid System

## Project Overview
**LetsBunk** is a comprehensive hybrid attendance management system with three main components:
1. **Mobile App** (Student & Teacher Interface)
2. **Admin Panel** (Desktop Application)
3. **Backend Server** (API & Real-time Services)

---

## 🎯 Complete Technology Stack

### **1. Mobile Application (React Native + Expo)**

#### **Core Framework**
- **React Native**: `^0.74.5` - Cross-platform mobile development
- **Expo**: `~51.0.28` - Development framework and build tools
- **React**: `^18.2.0` - UI library

#### **Programming Languages**
- **JavaScript (ES6+)** - Primary language for app logic
- **JSX** - UI component syntax

#### **Build Tools**
- **Babel**: `^7.28.6` - JavaScript compiler
- **Metro Bundler** - React Native bundler
- **Gradle** - Android build system
- **Kotlin** - Android native modules

#### **Mobile-Specific Libraries**
- **expo-camera**: `~15.0.16` - Camera access for face verification
- **expo-image-picker**: `~15.1.0` - Image selection
- **expo-image-manipulator**: `~12.0.5` - Image processing
- **expo-notifications**: `~0.28.19` - Push notifications
- **expo-sensors**: `~13.0.9` - Device sensors (accelerometer, gyroscope)
- **react-native-wifi-reborn**: `^4.12.0` - WiFi BSSID detection
- **react-native-webview**: `13.8.6` - WebView integration
- **react-native-svg**: `13.4.0` - SVG rendering
- **@react-native-async-storage/async-storage**: `1.23.1` - Local storage
- **@react-native-picker/picker**: `2.7.5` - Native picker component

#### **Face Recognition & AI**
- **face-api.js**: `^0.22.2` - Face detection and recognition
- **@tensorflow/tfjs**: `^4.22.0` - TensorFlow.js for ML
- **@tensorflow-models/face-landmarks-detection**: `^1.0.2` - Face landmarks
- **@mediapipe/tasks-vision**: `^0.10.14` - MediaPipe for computer vision
- **canvas**: `^3.2.0` - Canvas API for image processing

#### **Networking**
- **axios**: `^1.13.2` - HTTP client
- **socket.io-client**: `^4.8.1` - Real-time WebSocket communication

---

### **2. Backend Server (Node.js + Express)**

#### **Core Framework**
- **Node.js** - JavaScript runtime
- **Express**: `^4.18.2` - Web application framework

#### **Programming Languages**
- **JavaScript (Node.js)** - Server-side logic

#### **Database**
- **MongoDB Atlas** - Cloud NoSQL database
- **Mongoose**: `^8.19.1` - MongoDB ODM (Object Data Modeling)

#### **Real-time Communication**
- **Socket.IO**: `^4.8.1` - WebSocket server for real-time updates
- **HTTP Server** - Built-in Node.js HTTP module

#### **Caching & Session Management**
- **Redis**: `^4.7.0` - In-memory data store
  - Host: `redis-11769.crce206.ap-south-1-1.ec2.cloud.redislabs.com`
  - Port: `11769`

#### **Cloud Services**
- **Cloudinary**: `^2.8.0` - Image/video storage and CDN
  - Cloud Name: `cloudinary`
  - Used for storing face verification images

#### **Security & Middleware**
- **cors**: `^2.8.5` - Cross-Origin Resource Sharing
- **express-rate-limit**: `^8.2.1` - API rate limiting
- **dotenv**: `^17.2.3` - Environment variable management
- **JWT** - JSON Web Tokens for authentication
- **Session Management** - Express sessions

#### **Image Processing**
- **sharp**: `^0.33.0` - High-performance image processing

#### **Development Tools**
- **nodemon**: `^3.0.1` - Auto-restart development server

---

### **3. Admin Panel (Electron Desktop App)**

#### **Core Framework**
- **Electron**: `^27.0.0` - Cross-platform desktop application framework

#### **Programming Languages**
- **JavaScript** - Application logic
- **HTML5** - UI structure
- **CSS3** - Styling

#### **Build Tools**
- **electron-builder**: `^24.6.4` - Package and build desktop apps
- **NSIS** - Windows installer creator

#### **Dependencies**
- **electron-squirrel-startup**: `^1.0.0` - Windows installer integration

---

## 🗄️ Database Schemas

### **MongoDB Collections**

1. **Students Collection**
   - User profiles
   - Enrollment details
   - Face embeddings
   - Semester and branch information

2. **Teachers Collection**
   - Teacher profiles
   - Subject assignments
   - Classroom assignments

3. **Timetables Collection**
   - Period timings
   - Subject schedules
   - Room assignments
   - Semester-wise organization

4. **Attendance Sessions Collection**
   - Real-time attendance tracking
   - Timer values
   - WiFi BSSID validation
   - Random ring events

5. **Attendance Records Collection**
   - Daily attendance summaries
   - Lecture-wise attendance
   - Verification events
   - Percentage calculations

6. **Subjects Collection**
   - Subject codes
   - Subject names
   - Credits and type

7. **Classrooms Collection**
   - Room numbers
   - WiFi BSSID
   - Capacity
   - Marker embeddings (for Face + Sight)

8. **Random Ring Events Collection**
   - Ring timestamps
   - Student responses
   - Face verification results
   - Sight verification results

---

## 🔐 Authentication & Security

### **Authentication Methods**
- **JWT Tokens** - Stateless authentication
- **Session Secrets** - Server-side session management
- **Face Verification** - Biometric authentication
- **WiFi BSSID** - Location-based verification

### **Security Features**
- Rate limiting on API endpoints
- CORS protection
- Environment variable encryption
- Secure image storage (Cloudinary)
- Redis-based session management

---

## 🌐 Deployment & Infrastructure

### **Server Deployment**
- **Platform**: Render.com (Cloud hosting)
- **Environment**: Production
- **Port**: 3000
- **Database**: MongoDB Atlas (Cloud)
- **Cache**: Redis Labs (Cloud)
- **CDN**: Cloudinary

### **Mobile App Distribution**
- **Android**: APK build via Gradle
- **Package**: `com.countdowntimer.app`
- **Build Tools**: Android SDK 34

### **Admin Panel Distribution**
- **Windows**: NSIS installer
- **Package**: `com.letsbunk.admin`
- **Output**: Standalone executable

---

## 📦 Build Configuration

### **Android Build**
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34
- **Build Tools**: Latest
- **NDK Version**: As per Expo requirements
- **Signing**: Debug keystore (development)

### **Electron Build**
- **Target**: Windows x64
- **Installer**: NSIS
- **Output Directory**: `dist/`

---

## 🔄 Real-time Features

### **WebSocket Events**
- Student registration
- Timer synchronization
- Attendance updates
- Random ring notifications
- Timetable updates
- Face verification results

---

## 🎨 UI/UX Technologies

### **Mobile App**
- React Native components
- Custom animations
- SVG graphics
- WebView for fluid simulations
- Native navigation

### **Admin Panel**
- Electron native UI
- HTML/CSS/JavaScript
- Responsive design

---

## 📊 Analytics & Monitoring

### **Logging**
- Console logging with emojis
- Request/response tracking
- Error tracking
- Performance monitoring (slow request detection)

### **Metrics Tracked**
- API response times
- Database query performance
- Socket.IO connection status
- Student attendance percentages
- Teacher lecture statistics

---

## 🔧 Development Tools

### **Version Control**
- Git
- GitHub

### **Package Managers**
- npm (Node Package Manager)
- Gradle (Android dependencies)

### **Development Scripts**
- `npm start` - Start server
- `npm run dev` - Development mode with nodemon
- `npm run android` - Run Android app
- `npm run build` - Build production app

---

## 🌟 Key Features Implemented

### **Student App**
1. WiFi-based attendance (BSSID validation)
2. Face verification with liveness detection
3. Real-time timer synchronization
4. Timetable viewing
5. Attendance history
6. Random ring verification
7. Offline attendance management

### **Teacher App**
1. Live student tracking
2. Random ring triggering
3. Attendance reports
4. Timetable management
5. Student verification review

### **Admin Panel**
1. Student management
2. Teacher management
3. Timetable creation/editing
4. Classroom configuration
5. Attendance analytics
6. System configuration

---

## 📱 Supported Platforms

### **Mobile App**
- ✅ Android 5.0+ (API 21+)
- ⚠️ iOS (Expo compatible, not yet built)

### **Admin Panel**
- ✅ Windows 10/11 (x64)
- ⚠️ macOS (Electron compatible, not yet built)
- ⚠️ Linux (Electron compatible, not yet built)

### **Server**
- ✅ Linux (Render.com)
- ✅ Windows (Local development)
- ✅ macOS (Compatible)

---

## 🔮 Upcoming Technologies (Face + Sight Feature)

### **Computer Vision**
- **ArUco Markers** or **AprilTags** - Spatial marker detection
- **Pose Estimation** - Camera angle and distance calculation
- **Geometric Validation** - Marker spacing and perspective verification

### **Additional Libraries (Planned)**
- OpenCV.js - Advanced computer vision
- Three.js - 3D marker visualization
- TensorFlow Lite - On-device ML inference

---

## 📝 Environment Variables

### **Required Variables**
```env
# Database
MONGODB_URI=mongodb+srv://...

# Server
PORT=3000
NODE_ENV=production

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Redis
REDIS_HOST=...
REDIS_PORT=...
REDIS_USERNAME=...
REDIS_PASSWORD=...

# Security
JWT_SECRET=...
SESSION_SECRET=...

# Face Recognition
FACE_DETECTION_THRESHOLD=0.6
FACE_MATCH_THRESHOLD=0.6

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
ALLOWED_ORIGINS=*
```

---

## 🎯 System Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         ├─── HTTP/REST ───┐
         │                 │
         └─── WebSocket ───┤
                           │
                    ┌──────▼──────┐
                    │   Server    │
                    │  (Node.js)  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ MongoDB │      │  Redis  │      │Cloudinary│
    │  Atlas  │      │  Cache  │      │   CDN   │
    └─────────┘      └─────────┘      └─────────┘

┌─────────────────┐
│  Admin Panel    │
│   (Electron)    │
└────────┬────────┘
         │
         └─── HTTP/REST ───► Server
```

---

## 📄 License & Credits

- **Project**: LetsBunk Attendance System
- **Version**: 2.9
- **Last Updated**: December 2024
- **Developed by**: AttendanceApp-Hybrid Team

---

## 🚀 Quick Start Commands

### **Server**
```bash
npm install
npm start
```

### **Mobile App**
```bash
npm install
npx expo run:android
```

### **Admin Panel**
```bash
cd admin-panel
npm install
npm start
```

---

**End of Tech Stack Documentation**
