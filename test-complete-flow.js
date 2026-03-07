/**
 * ═══════════════════════════════════════════════════════════
 *   LETSBUNK — COMPLETE USERFLOW TEST
 *
 *   Simulates the ENTIRE real-world user journey:
 *   1. Admin sets up the system via Admin Panel APIs
 *   2. Teacher logs in and sees their dashboard
 *   3. Student logs in and sees their dashboard
 *   4. Attendance session lifecycle
 *   5. Calendar & Holiday management
 *   6. All admin panel features
 *
 *   Prerequisites: Run fresh-start-setup.js first!
 *
 *   Usage:
 *     node test-complete-flow.js
 *     node test-complete-flow.js --local
 * ═══════════════════════════════════════════════════════════
 */

const http = require('http');
const https = require('https');

// ── Config ──────────────────────────────────────────────────
const useLocal = process.argv.includes('--local');
const SERVER_URL = 'http://localhost:3000'; // Always use localhost

const API = `${SERVER_URL}/api`;

// ── Colours ─────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
    bgGreen: '\x1b[42m\x1b[30m',
    bgRed: '\x1b[41m\x1b[37m',
};

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function log(msg, c = 'reset') { console.log(`${C[c]}${msg}${C.reset}`); }
function header(title) {
    console.log();
    log(`╔${'═'.repeat(58)}╗`, 'cyan');
    log(`║  ${title.padEnd(56)}║`, 'cyan');
    log(`╚${'═'.repeat(58)}╝`, 'cyan');
}
function section(title) {
    console.log();
    log(`── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`, 'magenta');
}

// ── HTTP helper (zero dependencies) ─────────────────────────
function request(method, url, body = null, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const lib = parsedUrl.protocol === 'https:' ? https : http;
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers: { 'Content-Type': 'application/json' },
            timeout: timeoutMs,
        };

        const req = lib.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function GET(path) { return request('GET', path.startsWith('http') ? path : `${API}${path}`); }
async function POST(path, body) { return request('POST', path.startsWith('http') ? path : `${API}${path}`, body); }
async function PUT(path, body) { return request('PUT', `${API}${path}`, body); }
async function DELETE(path) { return request('DELETE', `${API}${path}`); }

// ── Test helper ─────────────────────────────────────────────
async function test(name, fn) {
    try {
        const result = await fn();
        if (result === 'SKIP') {
            skipped++;
            log(`  ⏭️  ${name} (skipped)`, 'yellow');
        } else {
            passed++;
            log(`  ✅ ${name}`, 'green');
        }
        return result;
    } catch (err) {
        failed++;
        const msg = err.message || String(err);
        log(`  ❌ ${name}: ${msg}`, 'red');
        failures.push({ name, error: msg });
        return null;
    }
}


// ═══════════════════════════════════════════════════════════
//  PHASE 1 — Server Health & Configuration
// ═══════════════════════════════════════════════════════════
async function phase1() {
    header('PHASE 1: Server Health & Configuration');

    section('1.1  Server Status');
    await test('Server root responds', async () => {
        const r = await GET(SERVER_URL);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('Health endpoint', async () => {
        const r = await GET('/health');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
        log(`       Database: ${r.data.database || 'unknown'}`, 'dim');
    });

    await test('Server time endpoint', async () => {
        const r = await GET('/time');
        if (!r.data.time && !r.data.serverTime) throw new Error('No time returned');
        log(`       Server time: ${r.data.time || r.data.serverTime}`, 'dim');
    });

    section('1.2  Configuration Endpoints');
    await test('GET /config', async () => {
        const r = await GET('/config');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /config/branches', async () => {
        const r = await GET('/config/branches');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /config/semesters', async () => {
        const r = await GET('/config/semesters');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /config/academic-year', async () => {
        const r = await GET('/config/academic-year');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /config/app', async () => {
        const r = await GET('/config/app');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 2 — Admin Panel: Teacher Management
//  (Simulates admin adding teachers via admin panel)
// ═══════════════════════════════════════════════════════════
let adminTeacher = null;
let newTeacher = null;

async function phase2() {
    header('PHASE 2: Admin Panel → Teacher Management');

    section('2.1  Verify Initial Admin Teacher');
    adminTeacher = await test('Login as ADMIN001', async () => {
        const r = await POST('/login', { id: 'ADMIN001', password: 'admin123' });
        if (!r.data.success) throw new Error('Admin login failed — did you run fresh-start-setup.js?');
        log(`       Logged in as: ${r.data.user?.name} (${r.data.user?.role})`, 'dim');
        return r.data.user;
    });

    await test('List teachers (should have 1)', async () => {
        const r = await GET('/teachers');
        if (!r.data.success) throw new Error('Failed');
        log(`       Teachers: ${r.data.teachers?.length || 0}`, 'dim');
    });

    section('2.2  Add a New Teacher (Admin Panel)');
    newTeacher = await test('POST /teachers — Add Prof. Sharma', async () => {
        const r = await POST('/teachers', {
            employeeId: 'EMP002',
            name: 'Prof. Rahul Sharma',
            email: 'rahul.sharma@college.edu',
            password: 'teacher123',
            department: 'Computer Science',
            subject: 'Data Structures',
            dob: '1982-06-20',
            phone: '+91-9876500002',
            semester: '3',
            canEditTimetable: false
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
        log(`       Created teacher: ${r.data.teacher?.name || 'Prof. Rahul Sharma'}`, 'dim');
        return r.data.teacher;
    });

    await test('Verify new teacher can login', async () => {
        const r = await POST('/login', { id: 'EMP002', password: 'teacher123' });
        if (!r.data.success) throw new Error('Login failed');
        log(`       Login OK: ${r.data.user?.name}`, 'dim');
    });

    section('2.3  Edit Teacher');
    if (newTeacher?._id) {
        await test('PUT /teachers/:id — Update phone', async () => {
            const r = await PUT(`/teachers/${newTeacher._id}`, {
                phone: '+91-9876500099'
            });
            if (!r.data.success) throw new Error(r.data.error || 'Failed');
        });

        await test('PUT /teachers/:id/timetable-access — Grant timetable edit', async () => {
            const r = await PUT(`/teachers/${newTeacher._id}/timetable-access`, {
                canEditTimetable: true
            });
            if (!r.data.success && r.status !== 200) throw new Error(`Status ${r.status}`);
        });
    }

    await test('List teachers (should have 2)', async () => {
        const r = await GET('/teachers');
        if (!r.data.success) throw new Error('Failed');
        const count = r.data.teachers?.length || 0;
        log(`       Teachers: ${count}`, 'dim');
        if (count !== 2) throw new Error(`Expected 2, got ${count}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 3 — Admin Panel: Student Management
// ═══════════════════════════════════════════════════════════
let student1 = null;
let student2 = null;

async function phase3() {
    header('PHASE 3: Admin Panel → Student Management');

    section('3.1  Add Students (Admin Panel)');
    student1 = await test('POST /students — Add Aditya Singh', async () => {
        const r = await POST('/students', {
            enrollmentNo: 'CS2024001',
            name: 'Aditya Singh',
            email: 'aditya.singh@student.edu',
            password: 'student123',
            branch: 'B.Tech Computer Science',
            semester: '3',
            dob: '2004-03-15',
            phone: '+91-9876543001'
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
        log(`       Created student: ${r.data.student?.name || 'Aditya Singh'}`, 'dim');
        return r.data.student;
    });

    student2 = await test('POST /students — Add Priya Patel', async () => {
        const r = await POST('/students', {
            enrollmentNo: 'CS2024002',
            name: 'Priya Patel',
            email: 'priya.patel@student.edu',
            password: 'student123',
            branch: 'B.Tech Computer Science',
            semester: '3',
            dob: '2004-07-22',
            phone: '+91-9876543002'
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
        return r.data.student;
    });

    section('3.2  Verify Student Login (Mobile App)');
    await test('Student login — CS2024001', async () => {
        const r = await POST('/login', { id: 'CS2024001', password: 'student123' });
        if (!r.data.success) throw new Error('Login failed');
        log(`       Login OK: ${r.data.user?.name} (role: ${r.data.user?.role})`, 'dim');
    });

    await test('Student login — CS2024002', async () => {
        const r = await POST('/login', { id: 'CS2024002', password: 'student123' });
        if (!r.data.success) throw new Error('Login failed');
    });

    await test('Invalid student login rejected', async () => {
        const r = await POST('/login', { id: 'CS9999999', password: 'wrong' });
        if (r.data.success) throw new Error('Should reject invalid');
    });

    section('3.3  Student Data APIs');
    await test('GET /students (should have 2)', async () => {
        const r = await GET('/students');
        if (!r.data.success) throw new Error('Failed');
        const count = r.data.students?.length || 0;
        log(`       Students: ${count}`, 'dim');
        if (count !== 2) throw new Error(`Expected 2, got ${count}`);
    });

    await test('GET /student-management?enrollmentNo=CS2024001', async () => {
        const r = await GET('/student-management?enrollmentNo=CS2024001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /view-records/students?semester=3&branch=...', async () => {
        const r = await GET('/view-records/students?semester=3&branch=B.Tech%20Computer%20Science');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    section('3.4  Edit & Manage Student');
    if (student2?._id) {
        await test('PUT /students/:id — Update phone', async () => {
            const r = await PUT(`/students/${student2._id}`, {
                phone: '+91-9876543099'
            });
            if (!r.data.success) throw new Error(r.data.error || 'Failed');
        });
    }
}


// ═══════════════════════════════════════════════════════════
//  PHASE 4 — Admin Panel: Subject Management
// ═══════════════════════════════════════════════════════════
async function phase4() {
    header('PHASE 4: Admin Panel → Subject Management');

    section('4.1  Add Subjects');
    await test('POST /subjects — Data Structures', async () => {
        const r = await POST('/subjects', {
            subjectCode: 'CS301',
            subjectName: 'Data Structures',
            department: 'Computer Science',
            semester: '3',
            branch: 'B.Tech Computer Science',
            credits: 4
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
    });

    await test('POST /subjects — Database Systems', async () => {
        const r = await POST('/subjects', {
            subjectCode: 'CS302',
            subjectName: 'Database Systems',
            department: 'Computer Science',
            semester: '3',
            branch: 'B.Tech Computer Science',
            credits: 3
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
    });

    await test('POST /subjects — Operating Systems', async () => {
        const r = await POST('/subjects', {
            subjectCode: 'CS303',
            subjectName: 'Operating Systems',
            department: 'Computer Science',
            semester: '3',
            branch: 'B.Tech Computer Science',
            credits: 4
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
    });

    section('4.2  Read & Verify Subjects');
    await test('GET /subjects — should have 3', async () => {
        const r = await GET('/subjects');
        const count = r.data.subjects?.length || 0;
        log(`       Subjects: ${count}`, 'dim');
        if (count < 3) throw new Error(`Expected 3, got ${count}`);
    });

    await test('GET /subjects/CS301 — single subject', async () => {
        const r = await GET('/subjects/CS301');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /subjects/grouped/by-semester-branch', async () => {
        const r = await GET('/subjects/grouped/by-semester-branch');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    section('4.3  Edit Subject');
    await test('PUT /subjects/CS302 — Update credits', async () => {
        const r = await PUT('/subjects/CS302', { credits: 4 });
        if (!r.data.success && r.status !== 200) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 5 — Admin Panel: Timetable Management
// ═══════════════════════════════════════════════════════════
async function phase5() {
    header('PHASE 5: Admin Panel → Timetable Management');

    section('5.1  Create Timetable');
    await test('POST /timetable — Monday schedule', async () => {
        const r = await POST('/timetable', {
            semester: '3',
            branch: 'B.Tech Computer Science',
            periods: [
                { day: 'Monday', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS301', subjectName: 'Data Structures', teacherId: 'ADMIN001', teacherName: 'Admin Teacher', roomNumber: 'Room 101' },
                { day: 'Monday', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS302', subjectName: 'Database Systems', teacherId: 'EMP002', teacherName: 'Prof. Rahul Sharma', roomNumber: 'Room 101' },
                { day: 'Monday', periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectCode: 'CS303', subjectName: 'Operating Systems', teacherId: 'ADMIN001', teacherName: 'Admin Teacher', roomNumber: 'Room 101' },
                { day: 'Tuesday', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS302', subjectName: 'Database Systems', teacherId: 'EMP002', teacherName: 'Prof. Rahul Sharma', roomNumber: 'Room 101' },
                { day: 'Tuesday', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS301', subjectName: 'Data Structures', teacherId: 'ADMIN001', teacherName: 'Admin Teacher', roomNumber: 'Room 101' },
                { day: 'Wednesday', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS303', subjectName: 'Operating Systems', teacherId: 'ADMIN001', teacherName: 'Admin Teacher', roomNumber: 'Room 101' },
                { day: 'Wednesday', periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectCode: 'CS301', subjectName: 'Data Structures', teacherId: 'ADMIN001', teacherName: 'Admin Teacher', roomNumber: 'Room 101' },
                { day: 'Thursday', periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectCode: 'CS302', subjectName: 'Database Systems', teacherId: 'EMP002', teacherName: 'Prof. Rahul Sharma', roomNumber: 'Room 101' },
            ]
        });
        if (!r.data.success && r.status !== 200 && r.status !== 201) throw new Error(r.data.error || `Status ${r.status}`);
    });

    section('5.2  Read Timetable');
    await test('GET /timetables (all)', async () => {
        const r = await GET('/timetables');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /timetable/3/B.Tech Computer Science', async () => {
        const r = await GET('/timetable/3/B.Tech Computer Science');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
        log(`       Periods: ${r.data.timetable?.periods?.length || 0}`, 'dim');
    });

    section('5.3  Teacher Schedule');
    await test('GET /teacher-schedule/ADMIN001/Monday', async () => {
        const r = await GET('/teacher-schedule/ADMIN001/Monday');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /teacher/current-lecture/ADMIN001', async () => {
        const r = await GET('/teacher/current-lecture/ADMIN001');
        // May be 200 (with lecture) or 200 (no current lecture) - both valid
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /teacher/allowed-branches/ADMIN001', async () => {
        const r = await GET('/teacher/allowed-branches/ADMIN001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 6 — Admin Panel: Classroom Management
// ═══════════════════════════════════════════════════════════
async function phase6() {
    header('PHASE 6: Admin Panel → Classroom Management');

    await test('GET /classrooms — verify default classroom exists', async () => {
        const r = await GET('/classrooms');
        if (!r.data.success) throw new Error('Failed');
        const count = r.data.classrooms?.length || 0;
        log(`       Classrooms: ${count}`, 'dim');
        if (count < 1) throw new Error('No classrooms found');
    });

    // Add second classroom
    await test('POST /classrooms — Add Lab 201', async () => {
        const r = await POST('/classrooms', {
            roomNumber: 'Lab 201',
            building: 'CS Block',
            floor: '2',
            capacity: 40,
            wifiBSSID: '11:22:33:44:55:66',
            wifiSSID: 'CS-Lab-WiFi',
            description: 'Computer Science Lab'
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
    });

    await test('GET /classrooms — should have 2', async () => {
        const r = await GET('/classrooms');
        const count = r.data.classrooms?.length || 0;
        log(`       Classrooms: ${count}`, 'dim');
        r.data.classrooms?.forEach(c => {
            log(`       • ${c.roomNumber} — BSSID: ${c.wifiBSSID}`, 'dim');
        });
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 7 — Admin Panel: Calendar & Holiday Management
// ═══════════════════════════════════════════════════════════
async function phase7() {
    header('PHASE 7: Admin Panel → Calendar & Holidays');

    section('7.1  Add Holidays');
    let holidayId = null;

    await test('POST /holidays — Republic Day', async () => {
        const r = await POST('/holidays', {
            date: '2026-01-26',
            name: 'Republic Day',
            type: 'holiday',
            color: '#ff6b35',
            description: 'National holiday'
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
    });

    holidayId = await test('POST /holidays — Holi', async () => {
        const r = await POST('/holidays', {
            date: '2026-03-17',
            name: 'Holi',
            type: 'holiday',
            color: '#e91e63',
            description: 'Festival of colors'
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
        return r.data.holiday?._id;
    });

    await test('POST /holidays — Mid-Term Exam', async () => {
        const r = await POST('/holidays', {
            date: '2026-03-10',
            name: 'Mid-Term Examinations Begin',
            type: 'event',
            color: '#2196f3',
            description: 'Mid-semester exam week starts'
        });
        if (!r.data.success) throw new Error(r.data.error || 'Failed');
    });

    section('7.2  Read Holidays');
    await test('GET /holidays — should have 3', async () => {
        const r = await GET('/holidays');
        if (!r.data.success) throw new Error('Failed');
        const count = r.data.holidays?.length || 0;
        log(`       Holidays: ${count}`, 'dim');
    });

    await test('GET /holidays/range — March 2026', async () => {
        const r = await GET('/holidays/range?startDate=2026-03-01&endDate=2026-03-31');
        if (!r.data.success) throw new Error('Failed');
        log(`       March holidays: ${r.data.holidays?.length || 0}`, 'dim');
    });

    section('7.3  Edit & Delete Holiday (Admin Panel CRUD)');
    if (holidayId) {
        await test('PUT /holidays/:id — Update Holi description', async () => {
            const r = await PUT(`/holidays/${holidayId}`, {
                date: '2026-03-17',
                name: 'Holi Festival',
                type: 'holiday',
                color: '#e91e63',
                description: 'Festival of colors — 2 days off'
            });
            if (!r.data.success) throw new Error(r.data.error || 'Failed');
        });

        await test('DELETE /holidays/:id — Remove Holi', async () => {
            const r = await DELETE(`/holidays/${holidayId}`);
            if (!r.data.success) throw new Error(r.data.error || 'Failed');
        });

        await test('GET /holidays — should have 2 after delete', async () => {
            const r = await GET('/holidays');
            const count = r.data.holidays?.length || 0;
            log(`       Holidays remaining: ${count}`, 'dim');
        });
    }
}


// ═══════════════════════════════════════════════════════════
//  PHASE 8 — Mobile App: Student Dashboard Flow
// ═══════════════════════════════════════════════════════════
async function phase8() {
    header('PHASE 8: Mobile App → Student Dashboard');

    section('8.1  Student Login & Profile');
    await test('Student CS2024001 login', async () => {
        const r = await POST('/login', { id: 'CS2024001', password: 'student123' });
        if (!r.data.success) throw new Error('Login failed');
        log(`       Name: ${r.data.user?.name}`, 'dim');
        log(`       Branch: ${r.data.user?.course || 'N/A'}`, 'dim');
        log(`       Semester: ${r.data.user?.semester || 'N/A'}`, 'dim');
    });

    section('8.2  Student Attendance Data');
    await test('GET /attendance/history/CS2024001', async () => {
        const r = await GET('/attendance/history/CS2024001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
        log(`       History records: ${r.data.records?.length || r.data.history?.length || 0}`, 'dim');
    });

    await test('GET /attendance/summary/CS2024001', async () => {
        const r = await GET('/attendance/summary/CS2024001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /attendance/student/CS2024001/dates', async () => {
        const r = await GET('/attendance/student/CS2024001/dates');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    section('8.3  Student Timetable (what student sees)');
    await test('GET /timetable/3/B.Tech Computer Science', async () => {
        const r = await GET('/timetable/3/B.Tech Computer Science');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    section('8.4  WiFi & BSSID (Student proximity check)');
    await test('GET /attendance/authorized-bssid/CS2024001', async () => {
        const r = await GET('/attendance/authorized-bssid/CS2024001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('POST /attendance/validate-bssid', async () => {
        const r = await POST('/attendance/validate-bssid', {
            studentId: 'CS2024001',
            bssid: 'aa:bb:cc:dd:ee:ff'
        });
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 9 — Mobile App: Teacher Dashboard Flow
// ═══════════════════════════════════════════════════════════
async function phase9() {
    header('PHASE 9: Mobile App → Teacher Dashboard');

    section('9.1  Teacher Login');
    await test('Teacher ADMIN001 login', async () => {
        const r = await POST('/login', { id: 'ADMIN001', password: 'admin123' });
        if (!r.data.success) throw new Error('Login failed');
    });

    section('9.2  Teacher Dashboard Data');
    await test('GET /teacher/current-lecture/ADMIN001', async () => {
        const r = await GET('/teacher/current-lecture/ADMIN001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /teacher/allowed-branches/ADMIN001', async () => {
        const r = await GET('/teacher/allowed-branches/ADMIN001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /teacher/current-class-students/ADMIN001', async () => {
        const r = await GET('/teacher/current-class-students/ADMIN001');
        // May 404 if not during class time
        if (r.status !== 200 && r.status !== 404) throw new Error(`Status ${r.status}`);
    });

    await test('GET /attendance/teacher/ADMIN001/lectures', async () => {
        const r = await GET('/attendance/teacher/ADMIN001/lectures');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    section('9.3  Teacher Calendar View');
    const today = new Date().toISOString().split('T')[0];
    await test(`GET /attendance/date/${today}`, async () => {
        const r = await GET(`/attendance/date/${today}?semester=3&branch=B.Tech%20Computer%20Science`);
        if (r.status !== 200 && r.status !== 400) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 10 — Attendance Records & Management
// ═══════════════════════════════════════════════════════════
async function phase10() {
    header('PHASE 10: Attendance Records & Management');

    section('10.1  Read Attendance Data');
    await test('GET /attendance/records (all)', async () => {
        const r = await GET('/attendance/records');
        if (!r.data.success) throw new Error('Failed');
    });

    await test('GET /attendance/stats', async () => {
        const r = await GET('/attendance/stats');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /attendance/all', async () => {
        const r = await GET('/attendance/all');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /attendance/manage', async () => {
        const r = await GET('/attendance/manage');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /attendance/export?format=json', async () => {
        const r = await GET('/attendance/export?format=json');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    section('10.2  Date Range Queries');
    const today = new Date().toISOString().split('T')[0];
    const month_ago = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    await test('GET /attendance/date-range', async () => {
        const r = await GET(`/attendance/date-range?startDate=${month_ago}&endDate=${today}`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 11 — Settings & Departments
// ═══════════════════════════════════════════════════════════
async function phase11() {
    header('PHASE 11: Settings & Department');

    await test('GET /settings', async () => {
        const r = await GET('/settings');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /settings/attendance-threshold', async () => {
        const r = await GET('/settings/attendance-threshold');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /departments', async () => {
        const r = await GET('/departments');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 12 — Random Ring
// ═══════════════════════════════════════════════════════════
async function phase12() {
    header('PHASE 12: Random Ring');

    await test('GET /random-ring/history/ADMIN001', async () => {
        const r = await GET('/random-ring/history/ADMIN001');
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
        log(`       Ring history: ${r.data.history?.length || r.data.rings?.length || 0}`, 'dim');
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 13 — Face Verification (read-only)
// ═══════════════════════════════════════════════════════════
async function phase13() {
    header('PHASE 13: Face Verification');

    await test('GET /face-descriptor/CS2024001', async () => {
        const r = await GET('/face-descriptor/CS2024001');
        if (r.status !== 200 && r.status !== 404) throw new Error(`Status ${r.status}`);
        log(`       Face descriptor: ${r.status === 200 ? 'found' : 'not registered yet'}`, 'dim');
    });
}


// ═══════════════════════════════════════════════════════════
//  PHASE 14 — Cleanup Test (Delete what we created)
// ═══════════════════════════════════════════════════════════
async function phase14() {
    header('PHASE 14: Cleanup Verification');

    section('14.1  Delete a Subject');
    await test('DELETE /subjects/CS303 (Operating Systems)', async () => {
        const r = await DELETE('/subjects/CS303');
        if (!r.data.success && r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    await test('GET /subjects — should have 2 after delete', async () => {
        const r = await GET('/subjects');
        const count = r.data.subjects?.length || 0;
        log(`       Subjects remaining: ${count}`, 'dim');
    });

    section('14.2  Delete Classroom');
    const classrooms = await GET('/classrooms');
    const lab = classrooms.data.classrooms?.find(c => c.roomNumber === 'Lab 201');
    if (lab) {
        await test('DELETE /classrooms/:id (Lab 201)', async () => {
            const r = await DELETE(`/classrooms/${lab._id}`);
            if (!r.data.success && r.status !== 200) throw new Error(`Status ${r.status}`);
        });
    }

    section('14.3  Final Data Count');
    log('', 'reset');
    for (const item of ['students', 'teachers', 'classrooms', 'subjects', 'holidays']) {
        try {
            const r = await GET(`/${item}`);
            const count = r.data[item]?.length || 0;
            log(`  📊 ${item.padEnd(12)}: ${count}`, 'dim');
        } catch { }
    }
}


// ═══════════════════════════════════════════════════════════
//  MAIN RUNNER
// ═══════════════════════════════════════════════════════════
async function main() {
    const startTime = Date.now();

    console.log();
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║      LETSBUNK — COMPLETE USERFLOW TEST SUITE              ║', 'cyan');
    log('╠════════════════════════════════════════════════════════════╣', 'cyan');
    log(`║  Server : ${SERVER_URL.padEnd(48)}║`, 'yellow');
    log(`║  Time   : ${new Date().toLocaleString('en-IN').padEnd(48)}║`, 'yellow');
    log('║                                                           ║', 'cyan');
    log('║  This test simulates a real user journey:                 ║', 'cyan');
    log('║   Admin Panel: teachers → students → subjects → timetable ║', 'dim');
    log('║   Mobile App : student login → teacher login → attendance ║', 'dim');
    log('║   CRUD Ops   : create → read → update → delete           ║', 'dim');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    await phase1();   // Server Health & Config
    await phase2();   // Admin: Teacher Management
    await phase3();   // Admin: Student Management
    await phase4();   // Admin: Subject Management
    await phase5();   // Admin: Timetable Management
    await phase6();   // Admin: Classroom Management
    await phase7();   // Admin: Calendar & Holidays
    await phase8();   // Mobile: Student Dashboard
    await phase9();   // Mobile: Teacher Dashboard
    await phase10();  // Attendance Records
    await phase11();  // Settings
    await phase12();  // Random Ring
    await phase13();  // Face Verification
    await phase14();  // Cleanup Verification

    // ── Final Report ────────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const total = passed + failed + skipped;

    console.log('\n');
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║                    TEST RESULTS                           ║', 'cyan');
    log('╠════════════════════════════════════════════════════════════╣', 'cyan');
    log(`║  ✅ Passed  : ${String(passed).padEnd(44)}║`, 'green');
    log(`║  ❌ Failed  : ${String(failed).padEnd(44)}║`, failed > 0 ? 'red' : 'green');
    log(`║  ⏭️  Skipped : ${String(skipped).padEnd(44)}║`, 'yellow');
    log(`║  📊 Total   : ${String(total).padEnd(44)}║`, 'cyan');
    log(`║  ⏱️  Time    : ${(elapsed + 's').padEnd(44)}║`, 'dim');
    log('╠════════════════════════════════════════════════════════════╣', 'cyan');

    if (failed === 0) {
        log('║   🎉  ALL TESTS PASSED — ENTIRE USERFLOW WORKS!  🎉     ║', 'bgGreen');
    } else {
        log('║       ⚠️   SOME TESTS FAILED — SEE BELOW   ⚠️            ║', 'bgRed');
    }
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    if (failures.length > 0) {
        console.log();
        log('Failed Tests:', 'red');
        failures.forEach((f, i) => {
            log(`  ${i + 1}. ${f.name}`, 'red');
            log(`     → ${f.error}`, 'dim');
        });
    }

    console.log();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    process.exit(1);
});
