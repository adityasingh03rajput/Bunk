/**
 * ═══════════════════════════════════════════════════════════
 *   LETSBUNK — QUICK FEATURE TEST
 *   Fast smoke test for core endpoints (no dependencies)
 * ═══════════════════════════════════════════════════════════
 *
 *  Usage:  node quick-test.js
 *          node quick-test.js --local   (test localhost:3000)
 */

const http = require('http');
const https = require('https');

const useLocal = process.argv.includes('--local');
const SERVER_URL = 'http://localhost:3000'; // Always use localhost

const API = `${SERVER_URL}/api`;

const C = {
    reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
    yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m'
};
function log(msg, c = 'reset') { console.log(`${C[c]}${msg}${C.reset}`); }

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
            timeout: 15000,
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

let passed = 0, failed = 0;

async function test(name, fn) {
    try {
        await fn();
        passed++;
        log(`  ✅ ${name}`, 'green');
    } catch (e) {
        failed++;
        log(`  ❌ ${name}: ${e.message}`, 'red');
    }
}

async function run() {
    log('\n╔════════════════════════════════════════╗', 'cyan');
    log('║        LETSBUNK QUICK TEST SUITE       ║', 'cyan');
    log('╚════════════════════════════════════════╝', 'cyan');
    log(`  Server: ${SERVER_URL}\n`, 'yellow');

    log('── Server ──────────────────────────────', 'cyan');
    await test('Server root', async () => {
        const r = await request('GET', SERVER_URL);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
    await test('Health check', async () => {
        const r = await request('GET', `${API}/health`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
    await test('Server time', async () => {
        const r = await request('GET', `${API}/time`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    log('\n── Data ────────────────────────────────', 'cyan');
    await test('Students', async () => {
        const r = await request('GET', `${API}/students`);
        if (!r.data.success) throw new Error('Failed');
        log(`       ${r.data.students?.length || 0} students`, 'dim');
    });
    await test('Teachers', async () => {
        const r = await request('GET', `${API}/teachers`);
        if (!r.data.success) throw new Error('Failed');
        log(`       ${r.data.teachers?.length || 0} teachers`, 'dim');
    });
    await test('Subjects', async () => {
        const r = await request('GET', `${API}/subjects`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
    await test('Classrooms', async () => {
        const r = await request('GET', `${API}/classrooms`);
        if (!r.data.success) throw new Error('Failed');
        log(`       ${r.data.classrooms?.length || 0} classrooms`, 'dim');
    });
    await test('Timetables', async () => {
        const r = await request('GET', `${API}/timetables`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    log('\n── Calendar & Holidays ─────────────────', 'cyan');
    await test('Holidays', async () => {
        const r = await request('GET', `${API}/holidays`);
        if (!r.data.success) throw new Error('Failed');
        log(`       ${r.data.holidays?.length || 0} holidays`, 'dim');
    });
    await test('Holidays range', async () => {
        const now = new Date();
        const s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const e = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        const r = await request('GET', `${API}/holidays/range?startDate=${s}&endDate=${e}`);
        if (!r.data.success) throw new Error('Failed');
    });

    log('\n── Attendance ──────────────────────────', 'cyan');
    await test('Attendance records', async () => {
        const r = await request('GET', `${API}/attendance/records`);
        if (!r.data.success) throw new Error('Failed');
        log(`       ${r.data.records?.length || 0} records`, 'dim');
    });
    await test('Attendance stats', async () => {
        const r = await request('GET', `${API}/attendance/stats`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    log('\n── Settings ────────────────────────────', 'cyan');
    await test('Settings', async () => {
        const r = await request('GET', `${API}/settings`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });
    await test('Departments', async () => {
        const r = await request('GET', `${API}/departments`);
        if (r.status !== 200) throw new Error(`Status ${r.status}`);
    });

    // Results
    const total = passed + failed;
    console.log();
    log('╔════════════════════════════════════════╗', 'cyan');
    log(`║  ✅ ${passed}/${total} passed  ${failed > 0 ? `❌ ${failed} failed` : '— All clear!'}`.padEnd(41) + '║', failed > 0 ? 'red' : 'green');
    log('╚════════════════════════════════════════╝', 'cyan');
    console.log();
}

run().catch(e => { log(`💥 ${e.message}`, 'red'); process.exit(1); });
