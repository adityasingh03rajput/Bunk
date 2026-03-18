/**
 * ═══════════════════════════════════════════════════════════
 *   LETSBUNK — FRESH START SETUP
 *
 *   Wipes the entire MongoDB database and seeds ONLY the
 *   absolute minimum data that a non-technical admin needs
 *   to bootstrap the system via Admin Panel + Mobile App.
 *
 *   What gets seeded:
 *   ─ 1 Admin Teacher  (to access admin panel & teacher app)
 *   ─ 1 Classroom      (with WiFi BSSID for attendance)
 *   ─ Default settings (attendance threshold, etc.)
 *
 *   Everything else (more teachers, students, subjects,
 *   timetable, holidays) should be added via the Admin Panel
 *   — just like a real non-coding user would do it.
 *
 *   Usage:
 *     node fresh-start-setup.js              (uses Render DB)
 *     node fresh-start-setup.js --local      (uses localhost)
 * ═══════════════════════════════════════════════════════════
 */

const http = require('http');
const https = require('https');

const useLocal = process.argv.includes('--local');
const SERVER_URL = 'http://localhost:3000'; // Always use localhost

const API = `${SERVER_URL}/api`;

// ── Colours ─────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
    yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m',
    magenta: '\x1b[35m', bold: '\x1b[1m',
    bgRed: '\x1b[41m\x1b[37m', bgGreen: '\x1b[42m\x1b[30m',
};
function log(msg, c = 'reset') { console.log(`${C[c]}${msg}${C.reset}`); }

// ── HTTP helper ─────────────────────────────────────────────
function request(method, url, body = null) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const lib = u.protocol === 'https:' ? https : http;
        const opts = {
            hostname: u.hostname,
            port: u.port || (u.protocol === 'https:' ? 443 : 80),
            path: u.pathname + u.search,
            method,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
        };
        const req = lib.request(opts, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, data }); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function GET(path) { return request('GET', `${API}${path}`); }
async function POST(path, body) { return request('POST', `${API}${path}`, body); }
async function DELETE(path) { return request('DELETE', `${API}${path}`); }

// ═══════════════════════════════════════════════════════════
//  STEP 1: Verify server is reachable
// ═══════════════════════════════════════════════════════════
async function verifyServer() {
    log('\n── Step 1: Verifying server connection...', 'cyan');
    try {
        const r = await request('GET', `${API}/health`);
        if (r.status === 200) {
            log('  ✅ Server is reachable', 'green');
            return true;
        }
        throw new Error(`Status ${r.status}`);
    } catch (err) {
        log(`  ❌ Cannot reach server: ${err.message}`, 'red');
        log(`     URL: ${SERVER_URL}`, 'dim');
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
//  STEP 2: Wipe ALL existing data
// ═══════════════════════════════════════════════════════════
async function wipeAllData() {
    log('\n── Step 2: Wiping all existing data...', 'cyan');

    // Delete all students
    try {
        const students = await GET('/students');
        if (students.data.success && students.data.students?.length > 0) {
            for (const s of students.data.students) {
                await DELETE(`/students/${s._id}`);
            }
            log(`  🗑️  Deleted ${students.data.students.length} students`, 'yellow');
        } else {
            log('  ✅ No students to delete', 'dim');
        }
    } catch (e) { log(`  ⚠️  Students: ${e.message}`, 'yellow'); }

    // Delete all teachers
    try {
        const teachers = await GET('/teachers');
        if (teachers.data.success && teachers.data.teachers?.length > 0) {
            for (const t of teachers.data.teachers) {
                await DELETE(`/teachers/${t._id}`);
            }
            log(`  🗑️  Deleted ${teachers.data.teachers.length} teachers`, 'yellow');
        } else {
            log('  ✅ No teachers to delete', 'dim');
        }
    } catch (e) { log(`  ⚠️  Teachers: ${e.message}`, 'yellow'); }

    // Delete all classrooms
    try {
        const classrooms = await GET('/classrooms');
        if (classrooms.data.success && classrooms.data.classrooms?.length > 0) {
            for (const c of classrooms.data.classrooms) {
                await DELETE(`/classrooms/${c._id}`);
            }
            log(`  🗑️  Deleted ${classrooms.data.classrooms.length} classrooms`, 'yellow');
        } else {
            log('  ✅ No classrooms to delete', 'dim');
        }
    } catch (e) { log(`  ⚠️  Classrooms: ${e.message}`, 'yellow'); }

    // Delete all holidays
    try {
        const holidays = await GET('/holidays');
        if (holidays.data.success && holidays.data.holidays?.length > 0) {
            for (const h of holidays.data.holidays) {
                await DELETE(`/holidays/${h._id}`);
            }
            log(`  🗑️  Deleted ${holidays.data.holidays.length} holidays`, 'yellow');
        } else {
            log('  ✅ No holidays to delete', 'dim');
        }
    } catch (e) { log(`  ⚠️  Holidays: ${e.message}`, 'yellow'); }

    // Delete all subjects
    try {
        const subjects = await GET('/subjects');
        if (subjects.data.success && subjects.data.subjects?.length > 0) {
            for (const s of subjects.data.subjects) {
                await DELETE(`/subjects/${s.subjectCode || s._id}`);
            }
            log(`  🗑️  Deleted ${subjects.data.subjects.length} subjects`, 'yellow');
        } else {
            log('  ✅ No subjects to delete', 'dim');
        }
    } catch (e) { log(`  ⚠️  Subjects: ${e.message}`, 'yellow'); }

    log('  ✅ Database wipe complete', 'green');
}

// ═══════════════════════════════════════════════════════════
//  STEP 3: Verify everything is empty
// ═══════════════════════════════════════════════════════════
async function verifyEmpty() {
    log('\n── Step 3: Verifying database is empty...', 'cyan');

    const checks = [
        { name: 'Students', path: '/students', key: 'students' },
        { name: 'Teachers', path: '/teachers', key: 'teachers' },
        { name: 'Classrooms', path: '/classrooms', key: 'classrooms' },
        { name: 'Holidays', path: '/holidays', key: 'holidays' },
        { name: 'Subjects', path: '/subjects', key: 'subjects' },
    ];

    let allEmpty = true;
    for (const check of checks) {
        try {
            const r = await GET(check.path);
            const count = r.data[check.key]?.length || 0;
            if (count > 0) {
                log(`  ❌ ${check.name}: ${count} remaining`, 'red');
                allEmpty = false;
            } else {
                log(`  ✅ ${check.name}: empty`, 'green');
            }
        } catch (e) {
            log(`  ⚠️  ${check.name}: ${e.message}`, 'yellow');
        }
    }

    return allEmpty;
}

// ═══════════════════════════════════════════════════════════
//  STEP 4: Seed the absolute minimum bootstrap data
// ═══════════════════════════════════════════════════════════
async function seedBootstrapData() {
    log('\n── Step 4: Seeding bootstrap data...', 'cyan');

    // ── 4a: Create 1 Admin Teacher ──────────────────────
    log('\n  📋 Creating Admin Teacher...', 'magenta');
    try {
        const teacherRes = await POST('/teachers', {
            employeeId: 'ADMIN001',
            name: 'Admin Teacher',
            email: 'admin@college.edu',
            password: 'admin123',
            department: 'Administration',
            subject: 'All',
            dob: '1985-01-15',
            phone: '+91-9999900000',
            semester: '3',
            canEditTimetable: true
        });

        if (teacherRes.data.success) {
            log('  ✅ Admin Teacher created', 'green');
            log('     ┌──────────────────────────────────────┐', 'dim');
            log('     │  Employee ID : ADMIN001               │', 'yellow');
            log('     │  Password    : admin123                │', 'yellow');
            log('     │  Role        : Teacher (Admin)         │', 'yellow');
            log('     │  Can Edit TT : Yes                     │', 'yellow');
            log('     └──────────────────────────────────────┘', 'dim');
        } else {
            log(`  ❌ Failed: ${teacherRes.data.error || JSON.stringify(teacherRes.data)}`, 'red');
        }
    } catch (e) {
        log(`  ❌ Teacher creation error: ${e.message}`, 'red');
    }

    // ── 4b: Create 1 Default Classroom ──────────────────
    log('\n  🏫 Creating Default Classroom...', 'magenta');
    try {
        const classroomRes = await POST('/classrooms', {
            roomNumber: 'Room 101',
            building: 'Main Building',
            floor: '1',
            capacity: 60,
            wifiBSSID: 'aa:bb:cc:dd:ee:ff',
            wifiSSID: 'College-WiFi',
            description: 'Default classroom - update BSSID from admin panel'
        });

        if (classroomRes.data.success) {
            log('  ✅ Default Classroom created', 'green');
            log('     ┌──────────────────────────────────────┐', 'dim');
            log('     │  Room        : Room 101                │', 'yellow');
            log('     │  WiFi BSSID  : aa:bb:cc:dd:ee:ff       │', 'yellow');
            log('     │  NOTE: Update BSSID in Admin Panel!    │', 'yellow');
            log('     └──────────────────────────────────────┘', 'dim');
        } else {
            log(`  ❌ Failed: ${classroomRes.data.error || JSON.stringify(classroomRes.data)}`, 'red');
        }
    } catch (e) {
        log(`  ❌ Classroom creation error: ${e.message}`, 'red');
    }

    // ── 4c: Set default settings ────────────────────────
    log('\n  ⚙️  Setting default attendance threshold...', 'magenta');
    try {
        const settingsRes = await POST('/settings/attendance-threshold', {
            threshold: 75
        });

        if (settingsRes.status === 200) {
            log('  ✅ Attendance threshold set to 75%', 'green');
        } else {
            log(`  ⚠️  Settings: Status ${settingsRes.status}`, 'yellow');
        }
    } catch (e) {
        log(`  ⚠️  Settings: ${e.message}`, 'yellow');
    }
}

// ═══════════════════════════════════════════════════════════
//  STEP 5: Final verification + show next steps
// ═══════════════════════════════════════════════════════════
async function finalVerification() {
    log('\n── Step 5: Final verification...', 'cyan');

    // Verify teacher login works
    try {
        const loginRes = await POST('/login', {
            id: 'ADMIN001',
            password: 'admin123'
        });

        if (loginRes.data.success) {
            log('  ✅ Admin Teacher login works!', 'green');
            log(`     Logged in as: ${loginRes.data.user?.name}`, 'dim');
        } else {
            log(`  ❌ Admin login failed: ${loginRes.data.message}`, 'red');
        }
    } catch (e) {
        log(`  ❌ Login test error: ${e.message}`, 'red');
    }

    // Count what we have
    const counts = {};
    for (const item of ['students', 'teachers', 'classrooms', 'holidays', 'subjects']) {
        try {
            const r = await GET(`/${item}`);
            counts[item] = r.data[item]?.length || 0;
        } catch { counts[item] = '?'; }
    }

    log('\n  📊 Database Status:', 'cyan');
    log(`     Students   : ${counts.students}`, counts.students === 0 ? 'dim' : 'green');
    log(`     Teachers   : ${counts.teachers}`, counts.teachers > 0 ? 'green' : 'red');
    log(`     Classrooms : ${counts.classrooms}`, counts.classrooms > 0 ? 'green' : 'red');
    log(`     Holidays   : ${counts.holidays}`, 'dim');
    log(`     Subjects   : ${counts.subjects}`, 'dim');
}

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
    console.log();
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║         LETSBUNK — FRESH START SETUP                      ║', 'cyan');
    log('╠════════════════════════════════════════════════════════════╣', 'cyan');
    log(`║  Server : ${SERVER_URL.padEnd(48)}║`, 'yellow');
    log(`║  Time   : ${new Date().toLocaleString('en-IN').padEnd(48)}║`, 'yellow');
    log('╠════════════════════════════════════════════════════════════╣', 'cyan');
    log('║  This will:                                               ║', 'yellow');
    log('║    1. DELETE all students, teachers, classrooms,          ║', 'red');
    log('║       holidays, subjects from the database                ║', 'red');
    log('║    2. Seed 1 admin teacher + 1 classroom + settings       ║', 'green');
    log('║    3. Leave everything else for you to add via Admin Panel ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    // Step 1: Verify server
    const alive = await verifyServer();
    if (!alive) {
        log('\n💥 Server unreachable. Start the server first.', 'red');
        process.exit(1);
    }

    // Step 2: Wipe all data
    await wipeAllData();

    // Step 3: Verify empty
    const empty = await verifyEmpty();
    if (!empty) {
        log('\n⚠️  Some data could not be deleted. Proceeding anyway...', 'yellow');
    }

    // Step 4: Seed bootstrap data
    await seedBootstrapData();

    // Step 5: Final verification
    await finalVerification();

    // ── Print next steps ────────────────────────────────
    console.log();
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║            🎉  FRESH START COMPLETE!  🎉                  ║', 'bgGreen');
    log('╠════════════════════════════════════════════════════════════╣', 'cyan');
    log('║                                                           ║', 'cyan');
    log('║  LOGIN CREDENTIALS:                                       ║', 'cyan');
    log('║  ┌─────────────────────────────────────────────┐          ║', 'cyan');
    log('║  │  Teacher Login:                              │          ║', 'cyan');
    log('║  │    ID       : ADMIN001                       │          ║', 'yellow');
    log('║  │    Password : admin123                        │          ║', 'yellow');
    log('║  └─────────────────────────────────────────────┘          ║', 'cyan');
    log('║                                                           ║', 'cyan');
    log('║  NEXT STEPS (do these in the Admin Panel):                ║', 'cyan');
    log('║                                                           ║', 'cyan');
    log('║  Step 1 │ Open Admin Panel → Set server URL               ║', 'yellow');
    log('║         │ to: ' + SERVER_URL.padEnd(44) + '║', 'yellow');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 2 │ Manage Teachers → Add real teachers             ║', 'yellow');
    log('║         │ (or import CSV with bulk upload)                  ║', 'dim');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 3 │ Manage Students → Add students                  ║', 'yellow');
    log('║         │ (or import CSV with bulk upload)                  ║', 'dim');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 4 │ Manage Subjects → Add subjects for each         ║', 'yellow');
    log('║         │ semester and branch                               ║', 'dim');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 5 │ Timetable → Create timetable for each           ║', 'yellow');
    log('║         │ semester/branch/day                               ║', 'dim');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 6 │ Classrooms → Update BSSID with real             ║', 'yellow');
    log('║         │ WiFi router MAC address                           ║', 'dim');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 7 │ Calendar → Add holidays and events              ║', 'yellow');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 8 │ Mobile App → Login as ADMIN001 to               ║', 'yellow');
    log('║         │ test teacher view                                 ║', 'dim');
    log('║         │                                                  ║', 'cyan');
    log('║  Step 9 │ Mobile App → Login as a student to              ║', 'yellow');
    log('║         │ test student view + attendance                    ║', 'dim');
    log('║                                                           ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    console.log();
}

main().catch(err => {
    log(`\n💥 Fatal error: ${err.message}`, 'red');
    process.exit(1);
});
