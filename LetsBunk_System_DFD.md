# LetsBunk Attendance Tracking System - Data Flow Diagram (DFD)

## System Overview
LetsBunk is a comprehensive React Native attendance tracking application with WiFi-based location validation, face recognition, and real-time teacher dashboard capabilities.

---

## Level 0 DFD - Context Diagram

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                                                             │
                    │              LETSBUNK ATTENDANCE SYSTEM                     │
                    │                                                             │
                    │  • WiFi-based Location Validation                          │
                    │  • Face Recognition Verification                           │
                    │  • Real-time Attendance Tracking                           │
                    │  • Teacher Dashboard & Management                          │
                    │  • Admin Panel for System Configuration                    │
                    │                                                             │
                    └─────────────────────────────────────────────────────────────┘
                              ▲                                    ▲
                              │                                    │
                    ┌─────────┴─────────┐                ┌───────┴────────┐
                    │                   │                │                │
                    ▼                   ▼                ▼                ▼
            ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
            │   STUDENTS   │    │   TEACHERS   │    │    ADMIN     │    │  CLASSROOM   │
            │              │    │              │    │              │    │   SYSTEMS    │
            │ • Login      │    │ • Login      │    │ • Manage     │    │              │
            │ • Attendance │    │ • Dashboard  │    │   Users      │    │ • WiFi BSSID │
            │ • Face Scan  │    │ • Monitor    │    │ • Timetables │    │ • Location   │
            │ • Timer      │    │ • Verify     │    │ • Reports    │    │   Data       │
            └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## Level 1 DFD - Main System Processes

```
                                    EXTERNAL ENTITIES
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   STUDENTS   │    │   TEACHERS   │    │    ADMIN     │    │  CLASSROOM   │
    │              │    │              │    │              │    │   SYSTEMS    │
    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
           │                   │                   │                   │
           │ Login/Attendance  │ Dashboard/Monitor │ Manage System     │ WiFi/Location
           │ Requests          │ Requests          │ Requests          │ Data
           ▼                   ▼                   ▼                   ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                           LETSBUNK SYSTEM                                      │
    │                                                                                 │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
    │  │   1. STUDENT    │  │   2. TEACHER    │  │   3. ADMIN      │  │ 4. LOCATION │ │
    │  │   ATTENDANCE    │  │   DASHBOARD     │  │   MANAGEMENT    │  │ VALIDATION  │ │
    │  │   TRACKING      │  │   MONITORING    │  │   SYSTEM        │  │ SYSTEM      │ │
    │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
    │           │                     │                     │                │        │
    │           ▼                     ▼                     ▼                ▼        │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
    │  │   5. FACE       │  │   6. REAL-TIME  │  │   7. DATA       │  │ 8. OFFLINE  │ │
    │  │   VERIFICATION  │  │   COMMUNICATION │  │   MANAGEMENT    │  │ SYNC        │ │
    │  │   SYSTEM        │  │   (SOCKET.IO)   │  │   & STORAGE     │  │ MANAGER     │ │
    │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
    └─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │     DATA STORES         │
                              │                         │
                              │ D1: Student Database    │
                              │ D2: Teacher Database    │
                              │ D3: Attendance Records  │
                              │ D4: Timetable Data      │
                              │ D5: Classroom Data      │
                              │ D6: Face Descriptors    │
                              │ D7: System Config       │
                              └─────────────────────────┘
```

---

## Level 2 DFD - Detailed Process Breakdown

### Process 1: Student Attendance Tracking

```
STUDENT ──login_request──► [1.1 AUTHENTICATE] ──user_data──► D1: Students
                                    │
                                    ▼ valid_user
                          [1.2 SEMESTER/BRANCH] ──timetable_request──► D4: Timetables
                                    │                                        │
                                    ▼ current_lecture                       │
                          [1.3 LOCATION VALIDATE] ◄──classroom_bssid────── D5: Classrooms
                                    │
                                    ▼ location_valid
                          [1.4 FACE VERIFICATION] ──face_data──► D6: Face Descriptors
                                    │                                        │
                                    ▼ face_verified                         │
                          [1.5 START ATTENDANCE] ──session_data──► D3: Attendance Records
                                    │
                                    ▼ timer_updates
                          [1.6 REAL-TIME SYNC] ──heartbeat──► Process 6: Real-time Comm
```

### Process 2: Teacher Dashboard Monitoring

```
TEACHER ──login_request──► [2.1 AUTHENTICATE] ──teacher_data──► D2: Teachers
                                    │
                                    ▼ valid_teacher
                          [2.2 GET CURRENT CLASS] ──schedule_query──► D4: Timetables
                                    │                                        │
                                    ▼ current_students                      │
                          [2.3 MONITOR STUDENTS] ◄──attendance_data────── D3: Attendance
                                    │
                                    ▼ student_list
                          [2.4 REAL-TIME DISPLAY] ──updates──► Process 6: Real-time Comm
                                    │
                                    ▼ verification_trigger
                          [2.5 RANDOM RING] ──ring_event──► Process 5: Face Verification
```

### Process 3: Admin Management System

```
ADMIN ──management_request──► [3.1 ADMIN AUTH] ──admin_data──► D2: Teachers
                                    │
                                    ▼ admin_access
                          [3.2 USER MANAGEMENT] ──crud_ops──► D1: Students
                                    │                              │
                                    ▼ timetable_ops               │
                          [3.3 TIMETABLE MGMT] ──schedule_data──► D4: Timetables
                                    │                                    │
                                    ▼ classroom_ops                     │
                          [3.4 CLASSROOM MGMT] ──room_data──► D5: Classrooms
                                    │
                                    ▼ reports_request
                          [3.5 REPORTS & ANALYTICS] ──query──► D3: Attendance Records
```

### Process 4: Location Validation System

```
STUDENT ──wifi_request──► [4.1 GET WIFI BSSID] ──native_call──► ANDROID WIFI MODULE
                                    │
                                    ▼ current_bssid
                          [4.2 VALIDATE LOCATION] ──bssid_check──► D5: Classrooms
                                    │                                    │
                                    ▼ validation_result                 │
                          [4.3 GRACE PERIOD MGR] ──grace_data──► D3: Attendance Records
                                    │
                                    ▼ location_status
                          [4.4 TIMER CONTROL] ──timer_state──► Process 1: Attendance
```

### Process 5: Face Verification System

```
STUDENT ──face_capture──► [5.1 CAPTURE PHOTO] ──image_data──► TENSORFLOW.JS MODELS
                                    │
                                    ▼ face_descriptor
                          [5.2 EXTRACT FEATURES] ──descriptor──► D6: Face Descriptors
                                    │                                    │
                                    ▼ stored_descriptor                 │
                          [5.3 COMPARE FACES] ──match_result──► D3: Attendance Records
                                    │
                                    ▼ verification_event
                          [5.4 LOG VERIFICATION] ──event_data──► Process 6: Real-time Comm
```

### Process 6: Real-time Communication (Socket.io)

```
MOBILE APP ──socket_connect──► [6.1 CONNECTION MGR] ──connection_data──► D7: System Config
                                    │
                                    ▼ real_time_events
                          [6.2 EVENT BROADCASTER] ──student_updates──► TEACHER DASHBOARD
                                    │                                        │
                                    ▼ timer_updates                         │
                          [6.3 TIMER SYNC] ──sync_data──► D3: Attendance Records
                                    │
                                    ▼ broadcast_events
                          [6.4 LIVE UPDATES] ──notifications──► ALL CONNECTED CLIENTS
```

### Process 7: Data Management & Storage

```
ALL PROCESSES ──data_requests──► [7.1 DATABASE MGR] ──queries──► MONGODB ATLAS
                                    │
                                    ▼ backup_data
                          [7.2 BACKUP SYSTEM] ──backups──► CLOUD STORAGE
                                    │
                                    ▼ sync_requests
                          [7.3 DATA SYNC] ──sync_data──► Process 8: Offline Sync
                                    │
                                    ▼ analytics_data
                          [7.4 ANALYTICS ENGINE] ──reports──► Process 3: Admin System
```

### Process 8: Offline Sync Manager

```
MOBILE APP ──offline_data──► [8.1 OFFLINE STORAGE] ──local_data──► ASYNCSTORAGE
                                    │
                                    ▼ connection_restored
                          [8.2 SYNC DETECTOR] ──sync_trigger──► Process 7: Data Management
                                    │
                                    ▼ queued_events
                          [8.3 EVENT QUEUE] ──batch_sync──► D3: Attendance Records
                                    │
                                    ▼ conflict_resolution
                          [8.4 CONFLICT RESOLVER] ──resolved_data──► Process 6: Real-time Comm
```

---

## Data Stores Detail

### D1: Student Database (MongoDB Collection: StudentManagement)
```
Data Elements:
• enrollmentNo (Primary Key)
• name, email, password (hashed)
• course, semester, dob, phone
• photoUrl (Cloudinary), faceDescriptor (encrypted)
• isActive, createdAt

Input Processes: 1.1, 3.2
Output Processes: 1.1, 2.3, 3.5
```

### D2: Teacher Database (MongoDB Collection: Teacher)
```
Data Elements:
• employeeId (Primary Key)
• name, email, password (hashed)
• department, subject, dob, phone
• photoUrl, canEditTimetable
• isActive, createdAt

Input Processes: 2.1, 3.1, 3.2
Output Processes: 2.1, 3.1, 3.5
```

### D3: Attendance Records (MongoDB Collections: AttendanceRecord, AttendanceSession)
```
Data Elements:
• studentId, enrollmentNo, date, status
• lectures[] (period, subject, teacher, room, times)
• attended, total, percentage, present
• verifications[] (time, type, success, event)
• totalAttended, totalClassTime, dayPercentage
• timerValue, checkInTime, checkOutTime

Input Processes: 1.5, 1.6, 4.3, 5.4, 6.3, 8.3
Output Processes: 2.3, 3.5, 7.4
```

### D4: Timetable Data (MongoDB Collection: Timetable)
```
Data Elements:
• semester, branch
• periods[] (number, startTime, endTime)
• timetable{day}[] (period, subject, teacher, room, isBreak)
• lastUpdated

Input Processes: 1.2, 3.3
Output Processes: 1.2, 2.2, 3.3
```

### D5: Classroom Data (MongoDB Collection: Classroom)
```
Data Elements:
• roomNumber (Primary Key)
• building, capacity
• bssid (WiFi MAC address)
• isActive, createdAt

Input Processes: 3.4
Output Processes: 1.3, 4.2
```

### D6: Face Descriptors (MongoDB - Encrypted field in StudentManagement)
```
Data Elements:
• studentId, encryptedDescriptor
• confidenceThreshold, lastUpdated
• verificationHistory

Input Processes: 5.2
Output Processes: 5.3
```

### D7: System Configuration (MongoDB Collection: SystemConfig)
```
Data Elements:
• serverSettings, themeConfig
• socketConnections, rateLimits
• featureFlags, maintenanceMode

Input Processes: 6.1, 7.1
Output Processes: 6.1, 7.1
```

---

## Key Data Flows

### 1. Student Attendance Flow
```
Student Login → Authentication → Location Validation → Face Verification → 
Timer Start → Real-time Updates → Attendance Recording → Grade Calculation
```

### 2. Teacher Monitoring Flow
```
Teacher Login → Current Class Detection → Student List Retrieval → 
Real-time Updates → Random Verification Trigger → Attendance Analytics
```

### 3. Admin Management Flow
```
Admin Access → User Management → Timetable Configuration → 
Classroom Setup → Report Generation → System Monitoring
```

### 4. Real-time Communication Flow
```
Mobile App Events → Socket.io Server → Event Broadcasting → 
Teacher Dashboard Updates → Student Notifications → Data Synchronization
```

### 5. Offline Handling Flow
```
Connection Lost → Local Storage → Event Queuing → 
Connection Restored → Batch Sync → Conflict Resolution → Data Merge
```

---

## Security & Validation Layers

### Authentication Layer
- Password hashing (bcrypt)
- Rate limiting (5 attempts/15 min)
- Session management
- Role-based access control

### Location Validation Layer
- WiFi BSSID verification
- Classroom mapping
- Grace period management
- Anti-spoofing measures

### Biometric Verification Layer
- Face descriptor encryption
- Confidence threshold validation
- Verification event logging
- Anti-fraud detection

### Data Protection Layer
- MongoDB Atlas encryption
- Cloudinary secure storage
- HTTPS/TLS communication
- Input sanitization

---

## Performance Optimizations

### Real-time Updates
- Socket.io connection pooling
- Event batching and throttling
- Selective data broadcasting
- Connection state management

### Database Optimization
- Indexed queries on frequently accessed fields
- Aggregation pipelines for analytics
- Connection pooling
- Query result caching

### Mobile App Optimization
- Offline-first architecture
- Background sync capabilities
- Image compression and caching
- Battery-efficient timer management

---

This DFD represents the complete data flow architecture of the LetsBunk attendance tracking system, showing how data moves between students, teachers, admin, and the various system components through multiple layers of processing and validation.