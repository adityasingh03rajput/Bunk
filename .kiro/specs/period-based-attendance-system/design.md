# Design Document: Period-Based Attendance System

## Overview

This design document specifies the architecture for redesigning the attendance tracking system from a continuous timer-based approach to a discrete period-based approach. The new system replaces real-time timer tracking with once-per-day student check-ins, random verification rings, and period-level attendance marking.

### System Context

The period-based attendance system is designed for educational institutions tracking student attendance across multiple academic periods per day (P1-P8). The system eliminates continuous time tracking in favor of discrete period attendance with configurable daily thresholds.

### Key Design Principles

1. **Simplicity**: Single daily check-in marks present for remaining periods
2. **Verification**: Face + WiFi verification required for all check-ins and random rings
3. **Flexibility**: Teachers can manually mark attendance and trigger unlimited random verifications
4. **Accuracy**: 75% daily threshold ensures meaningful attendance tracking
5. **Auditability**: Complete audit trail for all attendance modifications
6. **Performance**: Designed to handle 100+ concurrent check-ins efficiently

### Stakeholders

- **Students**: Check in once daily, respond to random verification rings
- **Teachers**: Trigger random rings, manually mark attendance, view real-time status
- **Administrators**: Configure thresholds, manage timetables, generate reports
- **System**: Backend server, database, real-time notification service


## Architecture

### High-Level Architecture

The system follows a client-server architecture with real-time communication capabilities:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
├──────────────────┬──────────────────┬──────────────────────────┤
│   Student_App    │   Teacher_App    │     Admin_Panel          │
│  (React Native)  │  (React Native)  │     (Electron)           │
│                  │                  │                          │
│  - Check-in UI   │  - Random Ring   │  - Threshold Config      │
│  - Period Status │  - Manual Mark   │  - Timetable Mgmt        │
│  - Verification  │  - Student List  │  - Reports & Analytics   │
└────────┬─────────┴────────┬─────────┴────────┬─────────────────┘
         │                  │                  │
         │ HTTPS/WebSocket  │ HTTPS/WebSocket  │ HTTPS
         │                  │                  │
┌────────┴──────────────────┴──────────────────┴─────────────────┐
│                      Backend Server                              │
│                   (Node.js + Express)                            │
├──────────────────────────────────────────────────────────────────┤
│  API Layer          │  Real-time Layer    │  Business Logic     │
│  - REST endpoints   │  - Socket.io        │  - Attendance calc  │
│  - Authentication   │  - Push notif       │  - Verification     │
│  - Rate limiting    │  - Event broadcast  │  - Threshold check  │
└────────┬────────────┴──────────┬──────────┴──────────┬──────────┘
         │                       │                      │
         │                       │                      │
┌────────┴───────────┐  ┌────────┴──────────┐  ┌──────┴──────────┐
│    MongoDB         │  │  Firebase Cloud   │  │  Face Verify    │
│    Database        │  │  Messaging (FCM)  │  │  Module (Native)│
│                    │  │                   │  │                 │
│  - PeriodAttend    │  │  - Push notif     │  │  - 192-float    │
│  - DailyAttend     │  │  - Delivery track │  │  - Similarity   │
│  - Timetable       │  │                   │  │  - AES-256      │
│  - StudentMgmt     │  │                   │  │                 │
│  - Classroom       │  │                   │  │                 │
└────────────────────┘  └───────────────────┘  └─────────────────┘
```

### Technology Stack

**Frontend Applications:**
- Student_App & Teacher_App: React Native (iOS/Android)
- Admin_Panel: Electron (Windows/Mac/Linux)
- UI Framework: React with custom components
- State Management: React Context API + AsyncStorage
- Real-time: Socket.io-client

**Backend Server:**
- Runtime: Node.js 18+
- Framework: Express.js
- Real-time: Socket.io
- Authentication: JWT tokens
- Rate Limiting: express-rate-limit
- Security: bcrypt, helmet, cors

**Database:**
- Primary: MongoDB Atlas (cloud-hosted)
- ODM: Mongoose
- Indexing: Compound indexes for performance
- Backup: Automated daily backups

**External Services:**
- Push Notifications: Firebase Cloud Messaging (FCM)
- Face Verification: Native Android module (existing)
- WiFi Detection: Native Android module (existing)


### System Components

#### 1. Student_App (React Native)

**Purpose**: Mobile application for students to check in and respond to verification requests

**Key Modules:**
- `CheckInScreen.js`: Daily check-in interface with face + WiFi verification
- `PeriodStatusView.js`: Display present/absent status for each period
- `RandomRingHandler.js`: Handle incoming random ring notifications
- `MonthlyCalendar.js`: Display monthly attendance calendar
- `FaceVerification.js`: Bridge to native face verification module (unchanged)
- `WiFiManager.js`: WiFi BSSID detection and validation (modified - remove grace period logic)

**State Management:**
- User session (enrollment number, semester, branch)
- Daily check-in status
- Period attendance records
- Random ring pending status

#### 2. Teacher_App (React Native)

**Purpose**: Mobile application for teachers to trigger verifications and mark attendance

**Key Modules:**
- `RandomRingTrigger.js`: Interface to trigger random rings (all students or select N)
- `VerificationStatus.js`: Real-time display of student responses
- `PeriodAttendanceGrid.js`: Grid view of all students × periods
- `ManualMarkingInterface.js`: Mark individual students present/absent
- `CurrentLectureView.js`: Display current lecture info from timetable

**State Management:**
- Teacher session (employee ID, assigned subjects)
- Current lecture context
- Student list for current class
- Random ring active status

#### 3. Admin_Panel (Electron)

**Purpose**: Desktop application for administrators to configure system and generate reports

**Key Modules:**
- `ThresholdConfig.js`: Configure daily attendance threshold (default 75%)
- `TimetableEditor.js`: Create/edit timetables with period definitions
- `AttendanceReports.js`: Generate and export attendance reports
- `ClassroomManagement.js`: Manage classroom WiFi BSSID mappings
- `AuditTrailViewer.js`: View complete audit history
- `SystemHealthDashboard.js`: Monitor error rates and performance

**State Management:**
- Admin session
- Configuration settings
- Report filters and data
- System metrics

#### 4. Backend_Server (Node.js/Express)

**Purpose**: Central server handling all business logic, data persistence, and real-time communication

**Key Modules:**
- `AttendanceController.js`: Handle check-in, random ring, manual marking
- `VerificationService.js`: Coordinate face + WiFi verification
- `ThresholdCalculator.js`: Calculate daily attendance based on threshold
- `TimetableService.js`: Manage timetable data and current period lookup
- `NotificationService.js`: Send push notifications via FCM
- `AuditLogger.js`: Record all attendance modifications
- `ReportGenerator.js`: Generate attendance reports and exports

**Middleware:**
- Authentication: JWT token validation
- Rate Limiting: Prevent abuse (100 req/min per IP)
- Error Handling: Centralized error responses
- Request Logging: Track all API calls


## Components and Interfaces

### Component Interaction Flows

#### Flow 1: Daily Student Check-In

```
Student_App                Backend_Server              MongoDB           FaceVerify    WiFiManager
     │                           │                        │                  │              │
     │ 1. Tap Check-In           │                        │                  │              │
     ├──────────────────────────>│                        │                  │              │
     │                           │                        │                  │              │
     │ 2. Capture Face           │                        │                  │              │
     │<──────────────────────────┤                        │                  │              │
     │                           │                        │                  │              │
     │ 3. Face Image             │                        │                  │              │
     ├──────────────────────────>│                        │                  │              │
     │                           │ 4. Verify Face         │                  │              │
     │                           ├───────────────────────────────────────────>│              │
     │                           │<───────────────────────────────────────────┤              │
     │                           │ 5. Face OK             │                  │              │
     │                           │                        │                  │              │
     │                           │ 6. Get BSSID           │                  │              │
     │                           ├────────────────────────────────────────────────────────────>│
     │                           │<────────────────────────────────────────────────────────────┤
     │                           │ 7. BSSID OK            │                  │              │
     │                           │                        │                  │              │
     │                           │ 8. Get Current Period  │                  │              │
     │                           ├───────────────────────>│                  │              │
     │                           │<───────────────────────┤                  │              │
     │                           │ 9. Period = P3         │                  │              │
     │                           │                        │                  │              │
     │                           │ 10. Mark P3-P8 Present │                  │              │
     │                           ├───────────────────────>│                  │              │
     │                           │<───────────────────────┤                  │              │
     │                           │ 11. Success            │                  │              │
     │                           │                        │                  │              │
     │ 12. Check-in Success      │                        │                  │              │
     │<──────────────────────────┤                        │                  │              │
     │ "Checked in from P3"      │                        │                  │              │
```

**API Endpoint**: `POST /api/attendance/check-in`

**Request Body:**
```json
{
  "enrollmentNo": "2021001",
  "faceEmbedding": [0.123, 0.456, ...], // 192 floats
  "wifiBSSID": "b4:86:18:6f:fb:ec",
  "timestamp": "2024-01-15T09:45:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checked in from P3 onwards",
  "checkInPeriod": "P3",
  "markedPeriods": ["P3", "P4", "P5", "P6", "P7", "P8"],
  "missedPeriods": ["P1", "P2"]
}
```


#### Flow 2: Random Verification Ring

```
Teacher_App          Backend_Server          MongoDB          Student_App(s)        FCM
     │                     │                    │                    │               │
     │ 1. Trigger Ring     │                    │                    │               │
     │ (Select 10 students)│                    │                    │               │
     ├────────────────────>│                    │                    │               │
     │                     │ 2. Create Ring     │                    │               │
     │                     ├───────────────────>│                    │               │
     │                     │<───────────────────┤                    │               │
     │                     │                    │                    │               │
     │                     │ 3. Send Push Notifications              │               │
     │                     ├─────────────────────────────────────────────────────────>│
     │                     │                    │                    │<──────────────┤
     │                     │                    │                    │ 4. Notification│
     │                     │                    │                    │                │
     │                     │                    │                    │ 5. Tap Verify  │
     │                     │<───────────────────────────────────────┤                │
     │                     │ 6. Verify Request  │                    │                │
     │                     │ (Face + WiFi)      │                    │                │
     │                     │                    │                    │                │
     │                     │ 7. Verification OK │                    │                │
     │                     ├───────────────────>│                    │                │
     │                     │ Mark Present       │                    │                │
     │                     │                    │                    │                │
     │ 8. Status Update    │                    │                    │                │
     │<────────────────────┤                    │                    │                │
     │ (9/10 verified)     │                    │                    │                │
     │                     │                    │                    │                │
     │                     │ 9. Timeout (10min) │                    │                │
     │                     ├───────────────────>│                    │                │
     │                     │ Mark Absent (1)    │                    │                │
```

**API Endpoints:**

1. **Trigger Random Ring**: `POST /api/attendance/random-ring/trigger`

**Request:**
```json
{
  "teacherId": "TEACH001",
  "semester": "3",
  "branch": "B.Tech Computer Science",
  "targetType": "all" | "select",
  "studentCount": 10,
  "selectedStudents": ["2021001", "2021002", ...]
}
```

**Response:**
```json
{
  "success": true,
  "ringId": "ring_abc123",
  "targetedStudents": 10,
  "notificationsSent": 10,
  "expiresAt": "2024-01-15T10:05:00Z"
}
```

2. **Verify Random Ring**: `POST /api/attendance/random-ring/verify`

**Request:**
```json
{
  "ringId": "ring_abc123",
  "enrollmentNo": "2021001",
  "faceEmbedding": [0.123, ...],
  "wifiBSSID": "b4:86:18:6f:fb:ec",
  "timestamp": "2024-01-15T09:57:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "currentPeriod": "P4",
  "markedPeriods": ["P4", "P5", "P6", "P7", "P8"]
}
```


#### Flow 3: Teacher Manual Marking

```
Teacher_App          Backend_Server          MongoDB          AuditLog
     │                     │                    │                │
     │ 1. Select Student   │                    │                │
     │ Mark Present P4     │                    │                │
     ├────────────────────>│                    │                │
     │                     │ 2. Validate Teacher│                │
     │                     │ Has Permission     │                │
     │                     │                    │                │
     │                     │ 3. Mark P4-P8      │                │
     │                     ├───────────────────>│                │
     │                     │<───────────────────┤                │
     │                     │                    │                │
     │                     │ 4. Log Audit       │                │
     │                     ├────────────────────────────────────>│
     │                     │                    │                │
     │ 5. Success          │                    │                │
     │<────────────────────┤                    │                │
```

**API Endpoint**: `POST /api/attendance/manual-mark`

**Request:**
```json
{
  "teacherId": "TEACH001",
  "enrollmentNo": "2021001",
  "period": "P4",
  "status": "present" | "absent",
  "reason": "Student arrived late with valid excuse",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "markedPeriods": ["P4", "P5", "P6", "P7", "P8"],
  "auditId": "audit_xyz789"
}
```

#### Flow 4: Daily Threshold Calculation

```
Scheduler            Backend_Server          MongoDB          DailyAttendance
     │                     │                    │                    │
     │ 1. End of Day       │                    │                    │
     │ (Cron: 23:59)       │                    │                    │
     ├────────────────────>│                    │                    │
     │                     │ 2. Get All Students│                    │
     │                     ├───────────────────>│                    │
     │                     │<───────────────────┤                    │
     │                     │                    │                    │
     │                     │ 3. For Each Student│                    │
     │                     │ Count Present      │                    │
     │                     │ Periods            │                    │
     │                     │                    │                    │
     │                     │ 4. Calculate %     │                    │
     │                     │ (6/8 = 75%)        │                    │
     │                     │                    │                    │
     │                     │ 5. Apply Threshold │                    │
     │                     │ (>= 75% = Present) │                    │
     │                     │                    │                    │
     │                     │ 6. Save Daily      │                    │
     │                     │ Record             │                    │
     │                     ├────────────────────────────────────────>│
     │                     │                    │                    │
     │ 7. Complete         │                    │                    │
     │<────────────────────┤                    │                    │
```

**Scheduled Job**: Runs daily at 23:59

**Logic:**
```javascript
for each student:
  presentPeriods = count(status = 'present')
  totalPeriods = 8
  percentage = (presentPeriods / totalPeriods) * 100
  
  if percentage >= threshold (75%):
    dailyStatus = 'present'
  else:
    dailyStatus = 'absent'
  
  save DailyAttendance record
```


## Data Models

### Database Schema Design

#### 1. PeriodAttendance Collection

**Purpose**: Store attendance status for each student, period, and date

```javascript
{
  _id: ObjectId,
  enrollmentNo: String,           // "2021001"
  studentName: String,             // "John Doe"
  date: Date,                      // 2024-01-15
  period: String,                  // "P1", "P2", ..., "P8"
  
  // Timetable context
  subject: String,                 // "Data Structures"
  teacher: String,                 // "TEACH001"
  teacherName: String,             // "Dr. Smith"
  room: String,                    // "Room 301"
  
  // Attendance status
  status: String,                  // "present" | "absent"
  checkInTime: Date,               // When marked present
  
  // Verification details
  verificationType: String,        // "initial" | "random" | "manual"
  wifiVerified: Boolean,           // true if WiFi check passed
  faceVerified: Boolean,           // true if face check passed
  wifiBSSID: String,               // "b4:86:18:6f:fb:ec"
  
  // Audit trail
  markedBy: String,                // Teacher ID if manual
  reason: String,                  // Reason for manual marking
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
// Compound index for fast queries
{ enrollmentNo: 1, date: 1, period: 1 }  // Unique

// Date-based queries
{ date: 1 }

// Teacher queries
{ teacher: 1, date: 1 }

// Status queries
{ status: 1, date: 1 }
```

#### 2. DailyAttendance Collection

**Purpose**: Aggregated daily attendance status per student

```javascript
{
  _id: ObjectId,
  enrollmentNo: String,           // "2021001"
  studentName: String,             // "John Doe"
  date: Date,                      // 2024-01-15
  
  // Period counts
  totalPeriods: Number,            // 8
  presentPeriods: Number,          // 6
  absentPeriods: Number,           // 2
  
  // Calculated values
  attendancePercentage: Number,    // 75.0
  dailyStatus: String,             // "present" | "absent"
  threshold: Number,               // 75 (threshold used)
  
  // Metadata
  semester: String,                // "3"
  branch: String,                  // "B.Tech Computer Science"
  
  // Timestamps
  createdAt: Date,
  calculatedAt: Date
}
```

**Indexes:**
```javascript
// Student queries
{ enrollmentNo: 1, date: -1 }

// Date range queries
{ date: -1 }

// Branch/semester queries
{ semester: 1, branch: 1, date: -1 }

// Status queries
{ dailyStatus: 1, date: -1 }
```


#### 3. StudentManagement Collection (Modified)

**Purpose**: Store student information and enrollment details

**Changes**: Remove timer-related fields

```javascript
{
  _id: ObjectId,
  enrollmentNo: String,            // "2021001" (unique)
  name: String,                    // "John Doe"
  email: String,                   // "john@example.com"
  
  // Academic info
  semester: String,                // "3"
  branch: String,                  // "B.Tech Computer Science"
  course: String,                  // "B.Tech"
  
  // Face verification
  faceEmbedding: [Number],         // 192 floats (encrypted)
  faceEnrolled: Boolean,           // true if face data exists
  
  // Authentication
  password: String,                // Hashed password
  
  // Status
  isActive: Boolean,               // true
  
  // REMOVED FIELDS:
  // - timerValue
  // - isRunning
  // - isPaused
  // - attendanceSession
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{ enrollmentNo: 1 }  // Unique
{ email: 1 }
{ semester: 1, branch: 1 }
{ isActive: 1 }
```

#### 4. Timetable Collection

**Purpose**: Store period schedules for each semester and branch

```javascript
{
  _id: ObjectId,
  semester: String,                // "3"
  branch: String,                  // "B.Tech Computer Science"
  
  // Period definitions
  periods: [
    {
      number: Number,              // 1, 2, 3, ..., 8
      startTime: String,           // "09:00"
      endTime: String              // "09:50"
    }
  ],
  
  // Weekly schedule
  timetable: {
    monday: [
      {
        period: Number,            // 1
        subject: String,           // "Data Structures"
        teacher: String,           // "TEACH001"
        teacherName: String,       // "Dr. Smith"
        room: String,              // "Room 301"
        isBreak: Boolean           // false
      }
    ],
    tuesday: [...],
    wednesday: [...],
    thursday: [...],
    friday: [...],
    saturday: [...],
    sunday: [...]
  },
  
  // Timestamps
  lastUpdated: Date,
  createdAt: Date
}
```

**Indexes:**
```javascript
{ semester: 1, branch: 1 }  // Unique
{ 'timetable.*.teacher': 1 }
```


#### 5. Classroom Collection

**Purpose**: Store classroom information and WiFi BSSID mappings

```javascript
{
  _id: ObjectId,
  roomNumber: String,              // "Room 301" (unique)
  building: String,                // "Main Building"
  floor: Number,                   // 3
  capacity: Number,                // 60
  
  // WiFi verification
  wifiBSSID: String,               // "b4:86:18:6f:fb:ec"
  wifiSSID: String,                // "College_WiFi"
  
  // Status
  isActive: Boolean,               // true
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{ roomNumber: 1 }  // Unique
{ wifiBSSID: 1 }
{ isActive: 1 }
```

#### 6. RandomRing Collection

**Purpose**: Track random verification rings triggered by teachers

```javascript
{
  _id: ObjectId,
  ringId: String,                  // "ring_abc123" (unique)
  
  // Teacher info
  teacherId: String,               // "TEACH001"
  teacherName: String,             // "Dr. Smith"
  
  // Target info
  semester: String,                // "3"
  branch: String,                  // "B.Tech Computer Science"
  period: String,                  // "P4"
  subject: String,                 // "Data Structures"
  room: String,                    // "Room 301"
  
  // Targeting
  targetType: String,              // "all" | "select"
  targetedStudents: [String],      // ["2021001", "2021002", ...]
  studentCount: Number,            // 10
  
  // Status tracking
  responses: [
    {
      enrollmentNo: String,        // "2021001"
      responded: Boolean,          // true
      verified: Boolean,           // true
      responseTime: Date,          // When responded
      faceVerified: Boolean,       // true
      wifiVerified: Boolean        // true
    }
  ],
  
  // Timing
  triggeredAt: Date,               // When ring was triggered
  expiresAt: Date,                 // 10 minutes after trigger
  completedAt: Date,               // When all responded or expired
  
  // Statistics
  totalResponses: Number,          // 9
  successfulVerifications: Number, // 8
  failedVerifications: Number,     // 1
  noResponses: Number,             // 1
  
  // Status
  status: String,                  // "active" | "expired" | "completed"
  
  // REMOVED FIELDS:
  // - timeBeforeRandomRing
  // - timerCutoff
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{ ringId: 1 }  // Unique
{ teacherId: 1, triggeredAt: -1 }
{ status: 1, expiresAt: 1 }
{ 'responses.enrollmentNo': 1 }
```


#### 7. AttendanceAudit Collection

**Purpose**: Maintain complete audit trail for all attendance modifications

```javascript
{
  _id: ObjectId,
  auditId: String,                 // "audit_xyz789" (unique)
  
  // Record reference
  recordType: String,              // "period_attendance" | "daily_attendance"
  recordId: ObjectId,              // Reference to PeriodAttendance._id
  
  // Student info
  enrollmentNo: String,            // "2021001"
  studentName: String,             // "John Doe"
  date: Date,                      // 2024-01-15
  period: String,                  // "P4" (null for daily)
  
  // Modification details
  modifiedBy: String,              // "TEACH001" or "ADMIN001"
  modifierName: String,            // "Dr. Smith"
  modifierRole: String,            // "teacher" | "admin"
  
  // Change tracking
  oldStatus: String,               // "absent"
  newStatus: String,               // "present"
  changeType: String,              // "create" | "update" | "delete"
  
  // Justification
  reason: String,                  // "Student arrived late with valid excuse"
  
  // Timestamps
  modifiedAt: Date,
  createdAt: Date
}
```

**Indexes:**
```javascript
{ auditId: 1 }  // Unique
{ enrollmentNo: 1, date: -1 }
{ modifiedBy: 1, modifiedAt: -1 }
{ recordId: 1 }
```

#### 8. SystemSettings Collection

**Purpose**: Store system-wide configuration settings

```javascript
{
  _id: ObjectId,
  settingKey: String,              // "daily_threshold" (unique)
  settingValue: Mixed,             // 75
  dataType: String,                // "number" | "string" | "boolean"
  description: String,             // "Minimum percentage for daily present"
  
  // Validation
  minValue: Number,                // 1
  maxValue: Number,                // 100
  
  // Metadata
  lastModifiedBy: String,          // "ADMIN001"
  lastModifiedAt: Date,
  createdAt: Date
}
```

**Indexes:**
```javascript
{ settingKey: 1 }  // Unique
```

### Database Relationships

```
StudentManagement (1) ──────> (N) PeriodAttendance
                                    │
                                    │ aggregates to
                                    ↓
                                (1) DailyAttendance

Timetable (1) ──────> (N) PeriodAttendance
                           (provides subject, teacher, room)

Classroom (1) ──────> (N) PeriodAttendance
                           (validates wifiBSSID)

Teacher (1) ──────> (N) RandomRing
                    (triggers verification)

RandomRing (1) ──────> (N) PeriodAttendance
                            (creates on verification)

PeriodAttendance (1) ──────> (N) AttendanceAudit
                                  (tracks changes)
```

