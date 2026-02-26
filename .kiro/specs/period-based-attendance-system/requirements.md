# Requirements Document: Period-Based Attendance System

## Introduction
(main task is to touch only the codes mentioned to be changed and delete , dont unnecessarily go for code deletion of any other unmentioned features . this is code editing not re creating whole app ) .
This document specifies requirements for redesigning the attendance tracking system from a continuous timer-based approach to a discrete period-based approach. The new system replaces real-time timer tracking with once-per-day student check-ins, random verification rings, and period-level attendance marking. The system eliminates timer sessions, heartbeats, and grace periods in favor of binary present/absent status per academic period.

## Glossary

- **Student_App**: The mobile application used by students for check-in and verification
- **Teacher_App**: The mobile application used by teachers to trigger verifications and view attendance
- **Admin_Panel**: The desktop application used by administrators to configure settings and view reports
- **Period**: A discrete time block in the academic day (P1, P2, P3, P4, P5, P6, P7, P8)
- **Check_In**: The initial daily verification performed by a student (face + WiFi)
- **Random_Ring**: A verification request triggered by a teacher targeting selected students
- **Daily_Threshold**: The minimum percentage of periods a student must attend to be marked present for the day
- **BSSID**: Basic Service Set Identifier - the MAC address of a WiFi access point used for location verification
- **Face_Embedding**: A 192-float vector representing a student's facial features for verification
- **Attendance_Status**: Binary value indicating present or absent for a specific period
- **Verification_Type**: The method by which attendance was marked (initial/random/manual)
- **Period_Attendance_Record**: A database record storing attendance status for one student, one period, one date
- **Timetable**: The schedule defining periods, subjects, teachers, and rooms for each day
- **Enrollment_Number**: Unique identifier for a student
- **Backend_Server**: The Node.js server handling attendance logic and database operations

## Requirements

### Requirement 1: Daily Student Check-In

**User Story:** As a student, I want to check in once per day when I arrive at class, so that I am marked present for all remaining periods without repeatedly verifying.

#### Acceptance Criteria

1. WHEN a student initiates check-in, THE Student_App SHALL verify the student's face against stored Face_Embedding
2. WHEN a student initiates check-in, THE Student_App SHALL verify the student's WiFi connection matches an authorized classroom BSSID
3. IF face verification fails OR WiFi verification fails, THEN THE Student_App SHALL reject the check-in and display an error message
4. WHEN both face and WiFi verification succeed, THE Backend_Server SHALL mark the student present for the current period and all subsequent periods of the day
5. WHEN a student checks in during period N, THE Backend_Server SHALL create Period_Attendance_Records with status "present" for periods N through the final period of the day
6. WHEN a student checks in during period N, THE Backend_Server SHALL NOT create Period_Attendance_Records for periods 1 through N-1 (late arrival - those periods remain absent)
7. THE Student_App SHALL allow check-in at any time during the academic day including late arrivals (e.g., arriving during P3)
8. WHEN a student has already checked in for the day, THE Student_App SHALL display the check-in status and prevent duplicate check-ins
9. THE Student_App SHALL display which period the student checked in from (e.g., "Checked in from P3 onwards")
10. WHEN a student checks in late, THE Student_App SHALL clearly indicate which periods were missed

### Requirement 2: Random Verification System

**User Story:** As a teacher, I want to trigger random verification rings to ensure students remain in class, so that attendance accuracy is maintained throughout the day.

#### Acceptance Criteria

1. THE Teacher_App SHALL provide a control to trigger a random verification ring
2. WHEN triggering a random ring, THE Teacher_App SHALL allow the teacher to select "all students" or specify N students
3. WHEN a random ring is triggered for selected students, THE Backend_Server SHALL send push notifications to those students
4. WHEN a student receives a random ring notification, THE Student_App SHALL prompt for face verification and WiFi verification
5. IF a student fails random verification (face OR WiFi fails), THEN THE Backend_Server SHALL mark the student absent for the current period ONLY
6. IF a student fails random verification, THEN THE Backend_Server SHALL NOT modify attendance status for past periods
7. IF a student fails random verification, THEN THE Backend_Server SHALL NOT automatically mark future periods as absent
8. WHEN a student fails random verification, THE Student_App SHALL allow the student to re-verify at any time
9. WHEN a student successfully re-verifies after failing (face AND WiFi pass), THE Backend_Server SHALL mark the student present for the current period and all subsequent periods
10. THE Teacher_App SHALL display real-time verification status showing which students have responded to the random ring
11. THE Backend_Server SHALL allow unlimited random rings per day per teacher
12. THE Backend_Server SHALL allow multiple teachers to trigger random rings simultaneously without conflicts

### Requirement 3: Period-Based Attendance Structure

**User Story:** As an administrator, I want attendance tracked per discrete period rather than continuous time, so that attendance records align with the academic timetable structure.

#### Acceptance Criteria

1. THE Backend_Server SHALL store attendance as Period_Attendance_Records with fields: enrollmentNo, date, period, subject, teacher, room, status, checkInTime, verificationType, wifiVerified, faceVerified, markedBy
2. THE Backend_Server SHALL support period identifiers P1, P2, P3, P4, P5, P6, P7, P8
3. THE Backend_Server SHALL retrieve period definitions from the Timetable including start time, end time, subject, teacher, and room
4. THE Backend_Server SHALL store Attendance_Status as a binary value: "present" or "absent"
5. THE Backend_Server SHALL NOT store timer seconds, heartbeat timestamps, or session durations
6. WHEN creating a Period_Attendance_Record, THE Backend_Server SHALL populate subject, teacher, and room from the Timetable for that period
7. THE Backend_Server SHALL allow querying attendance by enrollment number, date, and period

### Requirement 4: Daily Attendance Threshold Calculation

**User Story:** As an administrator, I want to define a daily attendance threshold, so that students must attend a minimum percentage of periods to be marked present for the day.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide a configuration field for Daily_Threshold as a percentage value
2. THE Backend_Server SHALL store Daily_Threshold as a unified value applying to all semesters and branches
3. THE Backend_Server SHALL default Daily_Threshold to 75 percent
4. WHEN calculating daily attendance, THE Backend_Server SHALL count the number of periods marked present
5. WHEN calculating daily attendance, THE Backend_Server SHALL divide present periods by total periods for the day
6. IF the calculated percentage is greater than or equal to Daily_Threshold, THEN THE Backend_Server SHALL mark the student present for the day
7. IF the calculated percentage is less than Daily_Threshold, THEN THE Backend_Server SHALL mark the student absent for the day
8. THE Backend_Server SHALL perform daily attendance calculation at the end of each academic day
9. THE Teacher_App SHALL NOT allow manual override of the Daily_Threshold calculation

### Requirement 5: Monthly Attendance Aggregation

**User Story:** As a student, I want to view my monthly attendance in a calendar format, so that I can track my attendance patterns over time.

#### Acceptance Criteria

1. THE Student_App SHALL display a monthly calendar view showing dates 1 through 31
2. WHEN displaying monthly attendance, THE Student_App SHALL retrieve daily attendance status for each date
3. THE Student_App SHALL display each date with a visual indicator showing "present" or "absent" status
4. THE Student_App SHALL calculate monthly attendance percentage as present days divided by total academic days
5. THE Student_App SHALL display the monthly attendance percentage prominently
6. THE Admin_Panel SHALL display monthly attendance aggregation for all students
7. THE Admin_Panel SHALL allow filtering monthly attendance by semester, branch, and date range

### Requirement 6: Teacher Manual Attendance Marking

**User Story:** As a teacher, I want to manually mark students present or absent for specific periods, so that I can correct attendance errors or handle special cases.

#### Acceptance Criteria

1. THE Teacher_App SHALL display a list of students enrolled in the teacher's current class
2. THE Teacher_App SHALL display the current period and attendance status for each student
3. THE Teacher_App SHALL provide controls to mark individual students present or absent for the current period
4. THE Teacher_App SHALL provide controls to mark individual students present or absent for any past period within the current day
5. WHEN a teacher manually marks a student present, THE Backend_Server SHALL create or update the Period_Attendance_Record with verificationType "manual"
6. WHEN a teacher manually marks a student absent, THE Backend_Server SHALL create or update the Period_Attendance_Record with status "absent" and verificationType "manual"
7. WHEN a teacher manually marks a student, THE Backend_Server SHALL record the teacher's identifier in the markedBy field
8. THE Teacher_App SHALL allow manual marking for past periods within the current day
9. THE Teacher_App SHALL NOT allow manual marking for future periods
10. THE Teacher_App SHALL NOT allow manual override of the Daily_Threshold calculation (75% rule still applies)
11. WHEN a teacher manually marks a student present, THE Backend_Server SHALL mark that student present for the current period and all subsequent periods (same behavior as check-in)
12. THE Teacher_App SHALL display a confirmation dialog before applying manual attendance changes

### Requirement 7: WiFi Verification for Location Validation

**User Story:** As an administrator, I want WiFi verification required for all check-ins and verifications, so that students can only mark attendance from authorized classroom locations.

#### Acceptance Criteria

1. WHEN performing initial check-in, THE Student_App SHALL retrieve the current WiFi BSSID from the device
2. WHEN performing initial check-in, THE Student_App SHALL send the BSSID to the Backend_Server for validation
3. WHEN performing random verification, THE Student_App SHALL retrieve the current WiFi BSSID from the device
4. WHEN performing random verification, THE Student_App SHALL send the BSSID to the Backend_Server for validation
5. THE Backend_Server SHALL maintain a mapping of authorized classroom BSSIDs
6. WHEN validating a BSSID, THE Backend_Server SHALL check if the BSSID exists in the authorized classroom mapping
7. IF the BSSID is not authorized, THEN THE Backend_Server SHALL reject the verification attempt
8. THE Backend_Server SHALL NOT implement grace periods for WiFi disconnection
9. THE Backend_Server SHALL NOT implement timer pause logic for WiFi status changes

### Requirement 8: Face Verification for Identity Validation

**User Story:** As an administrator, I want face verification required for all check-ins and verifications, so that only the enrolled student can mark their own attendance.

#### Acceptance Criteria

1. WHEN performing initial check-in, THE Student_App SHALL capture a face image using the device camera
2. WHEN performing initial check-in, THE Student_App SHALL generate a 192-float Face_Embedding from the captured image
3. WHEN performing initial check-in, THE Student_App SHALL send the Face_Embedding to the Backend_Server for comparison
4. WHEN performing random verification, THE Student_App SHALL capture a face image and generate a Face_Embedding
5. WHEN performing random verification, THE Student_App SHALL send the Face_Embedding to the Backend_Server for comparison
6. THE Backend_Server SHALL retrieve the stored Face_Embedding for the student from the database
7. THE Backend_Server SHALL calculate the similarity score between the captured and stored Face_Embeddings
8. IF the similarity score exceeds the configured threshold, THEN THE Backend_Server SHALL approve the face verification
9. IF the similarity score is below the configured threshold, THEN THE Backend_Server SHALL reject the face verification
10. THE Backend_Server SHALL use the existing FaceVerification module without modification

### Requirement 9: Database Schema Migration

**User Story:** As a developer, I want to migrate the database schema from timer-based to period-based structure, so that the new attendance system has appropriate data storage.

#### Acceptance Criteria

1. THE Backend_Server SHALL remove the AttendanceSession collection from the database completely
2. THE Backend_Server SHALL remove timer-related fields from the StudentManagement collection including timerValue, isRunning, isPaused, and attendanceSession
3. THE Backend_Server SHALL create a PeriodAttendance collection with schema: enrollmentNo (String), date (Date), period (String), subject (String), teacher (String), room (String), status (String enum: present/absent), checkInTime (Date), verificationType (String enum: initial/random/manual), wifiVerified (Boolean), faceVerified (Boolean), markedBy (String), createdAt (Date), updatedAt (Date)
4. THE Backend_Server SHALL create an index on PeriodAttendance collection for fields: enrollmentNo, date, period (compound index)
5. THE Backend_Server SHALL create an index on PeriodAttendance collection for field: date (for daily queries)
6. THE Backend_Server SHALL modify the AttendanceRecord schema to reference Period_Attendance_Records instead of timer-based lecture tracking
7. THE Backend_Server SHALL create a DailyAttendance collection with schema: enrollmentNo (String), date (Date), totalPeriods (Number), presentPeriods (Number), absentPeriods (Number), attendancePercentage (Number), dailyStatus (String enum: present/absent), threshold (Number), createdAt (Date)
8. THE Backend_Server SHALL NOT migrate existing timer-based attendance data to the new schema (fresh start)
9. THE Backend_Server SHALL provide a database migration script to execute schema changes safely
10. THE Backend_Server SHALL backup existing data before running migration script
11. THE Backend_Server SHALL remove all timer-related database indexes

### Requirement 10: Legacy Code Removal

**User Story:** As a developer, I want to remove all timer-based attendance code, so that the codebase contains only the new period-based system.

#### Acceptance Criteria

1. THE Backend_Server SHALL remove all endpoints related to timer operations: `/api/attendance/start-unified-timer`, `/api/attendance/stop-unified-timer`, `/api/attendance/pause-unified-timer`, `/api/attendance/resume-unified-timer`, `/api/attendance/update-timer`, `/api/attendance/get-timer-state`
2. THE Backend_Server SHALL remove all socket event handlers for timer synchronization: `timer_update`, `timer_broadcast`, `start_timer`, `stop_timer`, `pause_timer`, `resume_timer`
3. THE Student_App SHALL remove the CircularTimer.js component file completely
4. THE Student_App SHALL remove the UnifiedTimerManager.js module file completely
5. THE Student_App SHALL remove all imports and references to CircularTimer and UnifiedTimerManager
6. THE Student_App SHALL remove timer state management including: serverTimerData, displayTime, isRunning, timerState, displayIntervalRef, heartbeatIntervalRef
7. THE Student_App SHALL remove WiFi grace period logic (graceTimer, isInGracePeriod) while retaining BSSID checking functionality in WiFiManager.js
8. THE Student_App SHALL remove heartbeat transmission logic (HEARTBEAT_INTERVAL, sendHeartbeat function)
9. THE Student_App SHALL remove real-time timer update logic (10-second WebSocket emissions)
10. THE Student_App SHALL remove UI clock update intervals (1-second display time increments)
11. THE Teacher_App SHALL remove timer display components showing student timer values
12. THE Admin_Panel SHALL remove timer-based attendance report views and timer statistics
13. THE Backend_Server SHALL remove timer calculation logic for attendance percentage based on seconds
14. THE Backend_Server SHALL remove AttendanceSession schema and model completely
15. THE Backend_Server SHALL remove timer-related fields from RandomRing schema: timeBeforeRandomRing, timerCutoff
16. THE Backend_Server SHALL remove grace period management code from WiFi disconnection handlers
17. THE Student_App SHALL remove CACHE_KEY, DAILY_VERIFICATION_KEY constants related to timer state persistence
18. THE Student_App SHALL remove timer-related AsyncStorage operations (saving/loading timer state)

### Requirement 11: User Interface Updates

**User Story:** As a user, I want the application interfaces updated to reflect period-based attendance, so that I can interact with the new system effectively.

#### Acceptance Criteria

1. THE Student_App SHALL display a check-in button on the main screen
2. WHEN a student has checked in, THE Student_App SHALL display check-in status including the period from which attendance is marked
3. THE Student_App SHALL display a period attendance status view showing present/absent for each period of the current day
4. THE Teacher_App SHALL display a random ring trigger button with options for "all students" or "select N students"
5. THE Teacher_App SHALL display a real-time verification status view during random rings
6. THE Teacher_App SHALL display a period attendance grid showing all students and their status for each period
7. THE Admin_Panel SHALL display a period-based attendance report view with filters for date, semester, branch, and period
8. THE Admin_Panel SHALL display a Daily_Threshold configuration field
9. THE Admin_Panel SHALL display monthly attendance calendar views for students
10. THE Student_App SHALL remove all timer UI components including circular progress indicators and timer controls

### Requirement 12: Admin Panel Configuration and Reporting

**User Story:** As an administrator, I want comprehensive configuration and reporting tools, so that I can manage the attendance system and generate required reports.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide a configuration section for Daily_Threshold with validation for percentage values between 1 and 100
2. THE Admin_Panel SHALL display period-based attendance reports filterable by enrollment number, date range, semester, and branch
3. THE Admin_Panel SHALL provide an export function to download attendance data in CSV format
4. WHEN exporting attendance data, THE Admin_Panel SHALL include columns: enrollmentNo, date, period, subject, teacher, room, status, checkInTime, verificationType
5. THE Admin_Panel SHALL display a manual attendance marking interface allowing administrators to mark students present or absent for specific periods
6. THE Admin_Panel SHALL display a random ring history showing all triggered rings with timestamp, teacher, and target students
7. THE Admin_Panel SHALL display daily attendance summary showing total students, present students, absent students, and percentage
8. THE Admin_Panel SHALL display monthly attendance trends with graphical visualization
9. THE Admin_Panel SHALL provide a timetable configuration interface to define periods, subjects, teachers, and rooms

### Requirement 13: Parser and Serializer for Timetable Configuration

**User Story:** As an administrator, I want to import timetable data from configuration files, so that I can efficiently set up period schedules without manual entry.

#### Acceptance Criteria

1. WHEN a valid timetable configuration file is provided, THE Timetable_Parser SHALL parse it into a Timetable object
2. WHEN an invalid timetable configuration file is provided, THE Timetable_Parser SHALL return a descriptive error message indicating the line and nature of the error
3. THE Timetable_Parser SHALL validate that period identifiers match the pattern P1 through P8
4. THE Timetable_Parser SHALL validate that start times precede end times for each period
5. THE Timetable_Parser SHALL validate that periods do not overlap in time
6. THE Timetable_Pretty_Printer SHALL format Timetable objects back into valid timetable configuration files
7. FOR ALL valid Timetable objects, parsing then printing then parsing SHALL produce an equivalent Timetable object (round-trip property)
8. THE Timetable_Parser SHALL support JSON format with fields: period, subject, teacher, room, startTime, endTime
9. THE Admin_Panel SHALL provide a file upload interface for timetable configuration files
10. WHEN a timetable file is uploaded, THE Admin_Panel SHALL display parsing errors if validation fails

### Requirement 14: Real-Time Notification System

**User Story:** As a student, I want to receive immediate notifications when a random ring is triggered, so that I can respond promptly to verification requests.

#### Acceptance Criteria

1. WHEN a teacher triggers a random ring, THE Backend_Server SHALL send push notifications to all selected students within 5 seconds
2. THE Student_App SHALL display a notification alert when a random ring is received
3. THE Student_App SHALL provide a direct action in the notification to open the verification screen
4. WHEN a student taps the notification, THE Student_App SHALL navigate to the face and WiFi verification screen
5. THE Backend_Server SHALL use Firebase Cloud Messaging or equivalent push notification service
6. THE Backend_Server SHALL track notification delivery status for each student
7. IF a student does not respond to a random ring within 10 minutes, THE Backend_Server SHALL mark the student absent for the current period
8. THE Teacher_App SHALL display notification delivery status showing which students received the notification

### Requirement 15: Attendance Record Immutability and Audit Trail

**User Story:** As an administrator, I want attendance records to maintain an audit trail, so that all changes are traceable and the system maintains data integrity.

#### Acceptance Criteria

1. WHEN a Period_Attendance_Record is created, THE Backend_Server SHALL record the creation timestamp
2. WHEN a Period_Attendance_Record is modified, THE Backend_Server SHALL create a new record version rather than overwriting the existing record
3. THE Backend_Server SHALL maintain an audit log with fields: recordId, modifiedBy, modificationTimestamp, oldStatus, newStatus, reason
4. WHEN a teacher manually marks attendance, THE Backend_Server SHALL require a reason field for the audit log
5. THE Admin_Panel SHALL display the complete audit trail for any Period_Attendance_Record
6. THE Backend_Server SHALL prevent deletion of Period_Attendance_Records
7. THE Backend_Server SHALL allow querying the current status and historical changes for any student, date, and period combination

### Requirement 16: System Performance and Scalability

**User Story:** As a system administrator, I want the attendance system to handle concurrent check-ins and verifications efficiently, so that the system remains responsive during peak usage.

#### Acceptance Criteria

1. WHEN 100 students check in simultaneously, THE Backend_Server SHALL process all check-ins within 30 seconds
2. WHEN a random ring is triggered for 100 students, THE Backend_Server SHALL send all notifications within 10 seconds
3. THE Backend_Server SHALL process face verification requests with an average response time of less than 2 seconds
4. THE Backend_Server SHALL process WiFi verification requests with an average response time of less than 1 second
5. THE Backend_Server SHALL use database connection pooling to handle concurrent requests
6. THE Backend_Server SHALL implement request queuing for face verification to prevent resource exhaustion
7. THE Admin_Panel SHALL load attendance reports for 1000 students within 5 seconds
8. THE Backend_Server SHALL implement caching for timetable data to reduce database queries

### Requirement 17: Error Handling and Recovery

**User Story:** As a student, I want clear error messages and recovery options when verification fails, so that I can successfully mark my attendance despite temporary issues.

#### Acceptance Criteria

1. IF face verification fails due to poor lighting, THEN THE Student_App SHALL display a message instructing the student to move to better lighting and retry
2. IF WiFi verification fails, THEN THE Student_App SHALL display the detected BSSID and a message indicating the student is not in an authorized classroom
3. IF the Backend_Server is unreachable, THEN THE Student_App SHALL display a connection error message and provide a retry button
4. IF a random ring notification fails to deliver, THEN THE Backend_Server SHALL retry notification delivery up to 3 times
5. WHEN the Backend_Server encounters a database error, THE Backend_Server SHALL log the error details and return a generic error message to the client
6. THE Student_App SHALL provide a "Report Issue" button allowing students to submit verification problems to administrators
7. THE Admin_Panel SHALL display a system health dashboard showing error rates and failed verification attempts
8. THE Backend_Server SHALL implement automatic retry logic for transient database connection failures

### Requirement 18: Data Privacy and Security

**User Story:** As a student, I want my biometric and location data protected, so that my privacy is maintained while using the attendance system.

#### Acceptance Criteria

1. THE Backend_Server SHALL store Face_Embeddings in encrypted format using AES-256 encryption
2. THE Backend_Server SHALL transmit Face_Embeddings over HTTPS with TLS 1.2 or higher
3. THE Backend_Server SHALL NOT store raw face images after Face_Embedding generation
4. THE Backend_Server SHALL implement role-based access control restricting attendance data access to authorized users
5. THE Student_App SHALL request camera and location permissions with clear explanations of their usage
6. THE Backend_Server SHALL log all access to attendance records including user identifier and timestamp
7. THE Admin_Panel SHALL provide a data export function allowing students to download their own attendance records
8. THE Backend_Server SHALL implement rate limiting on verification endpoints to prevent brute force attacks
9. THE Backend_Server SHALL automatically delete attendance records older than 7 years in compliance with data retention policies

## Notes

This requirements document specifies a complete redesign from timer-based to period-based attendance tracking. The system eliminates continuous time tracking in favor of discrete period attendance with once-daily check-in, random verification, and configurable daily thresholds. All timer-related code and database structures will be removed and replaced with period-based equivalents.

Key design decisions:
- Single daily check-in marks present for remaining periods (not retroactive for missed periods)
- Late arrivals allowed - student can check in during any period (e.g., P3) and will be marked present from P3 onwards
- Random verification affects only current period when failed - student marked absent for that period only
- Failed random verification does NOT affect past periods or automatically mark future periods absent
- Successful re-verification after failure marks student present for current and all future periods
- Daily threshold (75%) is unified across all semesters/branches and cannot be overridden by teachers
- Teachers can manually mark students present/absent for specific periods
- Teacher manual marking of "present" follows same rule as check-in (marks present for current and future periods)
- No migration of legacy timer data (fresh start - all existing attendance data will be deleted)
- Face verification module (FaceVerification.js) remains unchanged - DO NOT MODIFY
- WiFi verification required for all check-ins and random verifications
- WiFi grace periods completely removed - no timer pause logic
- Unlimited random rings allowed per teacher per day
- Three ways to mark attendance: (1) Student check-in (face + WiFi), (2) Random ring verification (face + WiFi), (3) Teacher manual marking

Verification requirements:
- Initial check-in: Face verification + WiFi verification (both required)
- Random ring: Face verification + WiFi verification (both required)
- Teacher manual: No verification required (teacher discretion)

Attendance marking logic:
- Check-in at period N → Mark present for periods N, N+1, N+2, ... end of day
- Failed random ring at period N → Mark absent for period N only (past periods unchanged, future periods unchanged)
- Successful re-verification at period N → Mark present for periods N, N+1, N+2, ... end of day
- Teacher manual present at period N → Mark present for periods N, N+1, N+2, ... end of day
- Teacher manual absent at period N → Mark absent for period N only

Daily attendance calculation:
- Count present periods / total periods for the day
- If percentage >= 75%, daily status = "present"
- If percentage < 75%, daily status = "absent"
- Calculation runs at end of each academic day
