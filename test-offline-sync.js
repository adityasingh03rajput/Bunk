/**
 * ═══════════════════════════════════════════════════════════
 *   LETSBUNK — OFFLINE SYNC FEATURE TEST
 *
 *   Tests the offline attendance synchronization logic.
 *   
 *   CRITICAL: Removed duplicate endpoint. Now testing the
 *   single robust endpoint implementation.
 *
 *   Usage:
 *     node test-offline-sync.js
 *     node test-offline-sync.js --local
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
    bold: '\x1b[1m'
};
function log(msg, c = 'reset') { console.log(`${C[c]}${msg}${C.reset}`); }

// ── HTTP Helper ─────────────────────────────────────────────
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
            timeout: 10000
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
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ── Scenarios ───────────────────────────────────────────────

async function testOfflineSync() {
    console.log();
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║      LETSBUNK — OFFLINE SYNC DIAGNOSTIC                   ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    log(`Target: ${SERVER_URL}`, 'dim');

    // 1. Fetch student ID first (to get _id)
    const enrollmentNo = 'CS2024001';
    let studentId = null;
    let studentName = '';

    try {
        const r = await request('GET', `${API}/student-management?enrollmentNo=${enrollmentNo}`);
        if (!r.data.success) throw new Error('Student not found - run fresh-start-setup.js first');
        studentId = r.data.student._id;
        studentName = r.data.student.name;
        log(`   Found Student: ${studentName} (${studentId})`, 'green');
    } catch (e) {
        log(`   Error fetching student: ${e.message}`, 'red');
        return;
    }

    const now = new Date();
    const startTime = new Date(now - 3 * 60 * 60 * 1000); // 3 hours ago
    const endTime = now;

    // We send payload that satisfies BOTH implementations to see which logic applies
    // Implementation 1 uses: offlineDuration
    // Implementation 2 uses: totalOfflineSeconds (and caps at 2 hours = 7200s)

    const durationSeconds = 3 * 60 * 60; // 10800 seconds (3 hours)

    const payload = {
        studentId: studentId,
        studentName: studentName,
        // Common fields
        offlineStartTime: startTime.toISOString(),
        offlineEndTime: endTime.toISOString(),

        // For Implementation 1
        offlineDuration: durationSeconds,
        lastKnownSeconds: 0,
        lectureSubject: 'Diagnostic Test',

        // For Implementation 2
        totalOfflineSeconds: durationSeconds,
        lastKnownOnlineSeconds: 0,
        semester: '3',
        branch: 'B.Tech Computer Science',
        currentLecture: { subject: 'Diagnostic Test' },
        events: []
    };

    log('\n── Test Case: Sending 3 Hours (10800s) Offline Data ──', 'yellow');
    log(`   Ideally should CAP at 7200s (2 hours) via Robust Endpoint`, 'dim');

    try {
        const res = await request('POST', `${API}/attendance/sync-offline`, payload);

        log(`   Status: ${res.status}`, res.status === 200 ? 'green' : 'red');
        console.log('   Response:', JSON.stringify(res.data, null, 2));

        if (res.data.success) {
            // Check accepted seconds
            if (res.data.acceptedSeconds === 7200) {
                log('\n✅ RESULT: Robust Implementation is ACTIVE.', 'green');
                log('   The 2-hour cap was correctly applied.', 'green');
            } else if (res.data.seconds === 10800) {
                log('\n⚠️  RESULT: Old Implementation logic still active?', 'yellow');
            } else {
                log('\n❓ RESULT: Verify manually.', 'gray');
            }

        } else {
            log(`   Failed: ${res.data.error}`, 'red');
        }

    } catch (e) {
        log(`   Error: ${e.message}`, 'red');
    }
}

testOfflineSync();
