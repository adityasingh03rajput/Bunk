# Implementation Tasks: Period-Based Attendance System

## Task Overview

This document outlines the implementation tasks for migrating from a timer-based to a period-based attendance system. Tasks are organized by phase and include database migration, backend API development, frontend UI updates, and legacy code removal.

---

## Phase 1: Database Schema Migration

### Task 1: Database Schema Migration

**Description**: Migrate database from timer-based to period-based structure

**Sub-tasks**:

- [x] 1.1 Create database backup script
  - Write script to backup MongoDB database before migration
  - Test backup and restore functionality
  - Document backup location and retention policy

- [ ] 1.2 Create PeriodAttendance schema and model
  - Define Mongoose schema with all required fields
  - Add validation rules for status, verificationType enums
  - Create compound index: (enrollmentNo, date, period)
  - Create indexes: date, teacher, status

- [-] 1.3 Create DailyAttendance schema and model
  - Define Mongoose schema for daily aggregation
  - Add validation for percentage calculations
  - Create indexes: (enrollmentNo, date), date, (semester, branch, date)

- [x] 1.4 Create AttendanceAudit schema and model
  - Define Mongoose schema for audit trail
  - Add validation for changeType, modifierRole enums
  - Create indexes: auditId, (enrollmentNo, date), (modifiedBy, modifiedAt), recordId

- [x] 1.5 Create SystemSettings schema and model
  - Define Mongoose schema for configuration
  - Add validation for dataType, min/max values
  - Create unique index on settingKey
  - Seed default threshold value (75%)


- [x] 1.6 Remove timer fields from StudentManagement schema
  - Remove fields: timerValue, isRunning, isPaused, attendanceSession
  - Remove timer-related indexes
  - Update model validation rules

- [x] 1.7 Remove timer fields from RandomRing schema
  - Remove fields: timeBeforeRandomRing, timerCutoff
  - Update model validation rules
  - Preserve existing random ring functionality
  - migrate other data from backup and then re - remove timer fields

- [x] 1.8 Delete AttendanceSession collection
  - Create script to drop AttendanceSession collection
  - Verify no dependencies on this collection
  - Document data loss (no migration)

- [x] 1.9 Create database indexes for new collections
  - Run index creation for all new schemas
  - Verify index creation with explain() queries
  - Monitor index performance

- [x] 1.10 Create migration script to execute all schema changes
  - Write comprehensive migration script
  - Include rollback functionality
  - Add logging and error handling
  - Test on staging environment

---

## Phase 2: Backend API Development

### Task 2: Remove Legacy Timer Endpoints

**Description**: Remove all timer-based API endpoints and socket handlers

**Sub-tasks**:

- [x] 2.1 Remove timer API endpoints from server.js
  - Delete: /api/attendance/start-unified-timer
  - Delete: /api/attendance/stop-unified-timer
  - Delete: /api/attendance/pause-unified-timer
  - Delete: /api/attendance/resume-unified-timer
  - Delete: /api/attendance/update-timer
  - Delete: /api/attendance/get-timer-state

- [x] 2.2 Remove timer socket event handlers
  - Delete: timer_update handler
  - Delete: timer_broadcast handler
  - Delete: start_timer handler
  - Delete: stop_timer handler
  - Delete: pause_timer handler
  - Delete: resume_timer handler

- [x] 2.3 Remove timer calculation logic
  - Delete attendance percentage calculation based on seconds
  - Delete timer sync validation logic
  - Delete grace period management code


### Task 3: Implement Check-In API

**Description**: Create API endpoint for daily student check-in

**Sub-tasks**:

- [x] 3.1 Create POST /api/attendance/check-in endpoint
  - Accept: enrollmentNo, faceEmbedding, wifiBSSID, timestamp
  - Validate request body schema
  - Implement rate limiting (10 req/min per student)

- [x] 3.2 Implement face verification service
  - Call existing FaceVerification module
  - Compare captured embedding with stored embedding
  - Return similarity score and match result

- [x] 3.3 Implement WiFi verification service
  - Validate BSSID against Classroom collection
  - Check if BSSID is authorized for current room
  - Return authorization status

- [x] 3.4 Implement current period lookup
  - Query Timetable for current day and time
  - Determine current period (P1-P8)
  - Handle edge cases (before/after classes, breaks)

- [x] 3.5 Implement period marking logic
    READ WHOLE CODEBASE AND EDIT CODE ACCORDING TO THAT st
  - Create PeriodAttendance records for current period onwards
  - Mark status as "present" for P(N) through P8
  - Set verificationType as "initial"
  - Record face and WiFi verification status

- [x] 3.6 Implement duplicate check-in prevention
  - Check if student already checked in today
  - Return existing check-in status if duplicate
  - Prevent multiple check-ins per day

- [x] 3.7 Add error handling and logging
  - Handle face verification failures
  - Handle WiFi verification failures
  - Handle database errors
  - Log all check-in attempts


### Task 4: Implement Random Ring API

**Description**: Create API endpoints for random verification rings

**Sub-tasks**:

- [x] 4.1 Create POST /api/attendance/random-ring/trigger endpoint
  - Accept: teacherId, semester, branch, targetType, studentCount, selectedStudents
  - Validate teacher permissions
  - Implement rate limiting (5 rings/hour per teacher)

- [x] 4.2 Implement student selection logic
  - Handle "all" students selection
  - Handle "select N" students selection
  - Filter students by semester and branch
  - Filter only currently checked-in students

- [x] 4.3 Create RandomRing record
  - Generate unique ringId
  - Store targeted students list
  - Set expiration time (10 minutes)
  - Initialize response tracking

- [x] 4.4 Implement push notification service
  - Integrate Firebase Cloud Messaging (FCM)
  - Send notifications to random/all students
  - Track notification delivery status
  - Handle notification failures

- [x] 4.5 Create POST /api/attendance/random-ring/verify endpoint
  - Accept: ringId, enrollmentNo, faceEmbedding, wifiBSSID, timestamp
  - Validate ring is active and not expired
  - Perform face + WiFi verification

- [x] 4.6 Implement verification response handling
  - Update RandomRing response tracking
  - Mark student present for current + future periods if verified
  - Mark student absent for current period only if failed
  - Broadcast status update to teacher via WebSocket

- [x] 4.7 Implement timeout handling
  - Create scheduled job to check expired rings
  - Mark non-responding students absent for current period
  - Update ring status to "expired"
  - Notify teacher of final results


### Task 5: Implement Manual Marking API

**Description**: Create API endpoint for teacher manual attendance marking

**Sub-tasks**:

- [x] 5.1 Create POST /api/attendance/manual-mark endpoint
  - Accept: teacherId, enrollmentNo, period, status, reason, timestamp
  - Validate teacher permissions for the class
  - Validate period is not in the future

- [x] 5.2 Implement manual marking logic
  - If marking "present": mark current period + all future periods
  - If marking "absent": mark only the specified period
  - Set verificationType as "manual"
  - Record teacher ID in markedBy field

- [x] 5.3 Implement audit logging
  - Create AttendanceAudit record for each change
  - Record old status, new status, reason
  - Track modifier details (teacher ID, name, role)
  - Generate unique auditId

- [x] 5.4 Add validation and error handling
  - Validate teacher teaches the specified class
  - Validate period exists in timetable
  - Handle concurrent marking conflicts
  - Return detailed error messages

### Task 6: Implement Daily Threshold Calculation

**Description**: Create scheduled job to calculate daily attendance

**Sub-tasks**:

- [x] 6.1 Create scheduled job (cron: 23:59 daily)
  - Use node-cron or similar scheduler
  - Run calculation for all students
  - Handle job failures and retries

- [x] 6.2 Implement threshold calculation logic
  - Count present periods per student
  - Calculate percentage: (present / total) * 100
  - Compare against threshold (default 75%)
  - Determine daily status: present or absent

- [x] 6.3 Create DailyAttendance records
  - Store calculated values for each student
  - Include period counts and percentage
  - Record threshold value used
  - Add semester and branch metadata

- [x] 6.4 Add error handling and logging
  - Log calculation start and completion
  - Handle missing timetable data
  - Handle database errors
  - Send admin alerts on failures


### Task 7: Implement Reporting APIs

**Description**: Create API endpoints for attendance reports and exports

**Sub-tasks**:

- [x] 7.1 Create GET /api/attendance/period-report endpoint
  - Accept filters: enrollmentNo, date, semester, branch, period
  - Return PeriodAttendance records
  - Implement pagination (50 records per page)
  - Add sorting options

- [x] 7.2 Create GET /api/attendance/daily-report endpoint
  - Accept filters: enrollmentNo, dateRange, semester, branch
  - Return DailyAttendance records
  - Calculate summary statistics
  - Implement pagination

- [x] 7.3 Create GET /api/attendance/monthly-report endpoint
  - Accept: enrollmentNo, month, year
  - Return daily attendance for entire month
  - Calculate monthly percentage
  - Format as calendar data

- [x] 7.4 Create GET /api/attendance/export endpoint
  - Accept same filters as reports
  - Generate CSV file with attendance data
  - Include columns: enrollmentNo, date, period, subject, teacher, room, status, verificationType
  - Stream large exports

- [x] 7.5 Create GET /api/attendance/audit-trail endpoint
  - Accept: enrollmentNo, date, period
  - Return complete audit history
  - Show all modifications with timestamps
  - Include modifier details

---

## Phase 3: Frontend - Student App

### Task 8: Remove Timer UI Components

**Description**: Remove all timer-related UI from Student App

**Sub-tasks**:

- [⚠️] 8.1 Delete CircularTimer.js component file ( only timer code and not the circular ui)
  - dont Remove file completely
  - Remove all imports referencing this file
  - STATUS: Deferred - CircularTimer.js kept for potential future use, import removed from App.js

- [x] 8.2 Delete UnifiedTimerManager.js module file
  - Remove file completely
  - Remove all imports referencing this file

- [x] 8.3 Remove timer state from App.js
  - Remove: serverTimerData, displayTime, isRunning, timerState
  - Remove: displayIntervalRef, heartbeatIntervalRef
  - Remove: useUnifiedTimer hook usage
  - Remove: timer-related useEffect hooks
  - STATUS: Complete - All timer state variables and hooks removed

- [x] 8.4 Remove timer UI elements from App.js
  - Remove CircularTimer component rendering (except the period circle)
  - Remove timer display text
  - Remove start/stop/pause buttons
  - Remove timer progress indicators
  - STATUS: Complete - Replaced with period information card

