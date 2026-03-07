/**
 * ═══════════════════════════════════════════════════════════
 *   LETSBUNK — DEPENDENCY INTEGRITY TEST
 *
 *   Verifies that all critical server-side libraries are:
 *   1. Installed in node_modules
 *   2. Require-able without errors
 *   3. capable of basic initialization
 *
 *   Usage:
 *     node test-dependencies.js
 * ═══════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

// ── Colours ─────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
    yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m'
};
function log(msg, c = 'reset') { console.log(`${C[c]}${msg}${C.reset}`); }

let passed = 0;
let failed = 0;

function check(name, fn) {
    try {
        fn();
        log(`  ✅ ${name}`, 'green');
        passed++;
    } catch (e) {
        log(`  ❌ ${name}: ${e.message.split('\n')[0]}`, 'red');
        failed++;
    }
}

async function checkAsync(name, fn) {
    try {
        await fn();
        log(`  ✅ ${name}`, 'green');
        passed++;
    } catch (e) {
        log(`  ❌ ${name}: ${e.message.split('\n')[0]}`, 'red');
        failed++;
    }
}

console.log();
log('╔════════════════════════════════════════════════════════════╗', 'cyan');
log('║      LETSBUNK — DEPENDENCY CHECK                          ║', 'cyan');
log('╚════════════════════════════════════════════════════════════╝', 'cyan');
console.log();

// ── 1. Core Server Libraries ────────────────────────────────
log('── Core Server Libraries ──────────────────────', 'cyan');

check('express', () => {
    const express = require('express');
    const app = express();
    if (typeof app.use !== 'function') throw new Error('Express app creation failed');
});

check('http', () => {
    const http = require('http');
    if (!http.createServer) throw new Error('http module broken');
});

check('fs & path & os', () => {
    require('fs'); require('path'); require('os');
});

check('dotenv', () => {
    const dotenv = require('dotenv');
    if (typeof dotenv.config !== 'function') throw new Error('dotenv.config missing');
});

check('cors', () => {
    const cors = require('cors');
    if (typeof cors !== 'function') throw new Error('cors not a function');
});

check('express-rate-limit', () => {
    const rateLimit = require('express-rate-limit');
    // rateLimit v6/v7 returns a function directly
    if (typeof rateLimit !== 'function' && typeof rateLimit.rateLimit !== 'function') {
        throw new Error('express-rate-limit export unexpected');
    }
});

check('axios', () => {
    const axios = require('axios');
    if (typeof axios.get !== 'function') throw new Error('axios.get missing');
});

// ── 2. Database & Realtime ──────────────────────────────────
log('\n── Database & Realtime ────────────────────────', 'cyan');

check('mongoose', () => {
    const mongoose = require('mongoose');
    if (typeof mongoose.connect !== 'function') throw new Error('mongoose.connect missing');
    if (typeof mongoose.Schema !== 'function') throw new Error('mongoose.Schema missing');
});

check('socket.io', () => {
    const { Server } = require('socket.io');
    const { io } = require('socket.io-client'); // Check client lib too
    if (typeof Server !== 'function') throw new Error('socket.io Server missing');
});

check('redis (client lib)', () => {
    const redis = require('redis');
    if (typeof redis.createClient !== 'function') throw new Error('redis.createClient missing');
});

// ── 3. AI & Image Processing ────────────────────────────────
log('\n── AI & Image Processing ──────────────────────', 'cyan');

check('face-api.js', () => {
    const faceapi = require('face-api.js');
    if (!faceapi.nets) throw new Error('face-api.js nets missing');
});

check('@tensorflow/tfjs', () => {
    require('@tensorflow/tfjs');
    // Just requiring it is enough to verification installation
});

check('canvas', () => {
    try {
        require('canvas');
    } catch (e) {
        throw new Error('canvas binary missing (common issue on Windows/Mac if build tools missing). ' + e.message);
    }
});

check('sharp', () => {
    const sharp = require('sharp');
    if (typeof sharp !== 'function') throw new Error('sharp not a function');
});

check('cloudinary', () => {
    const cloudinary = require('cloudinary').v2;
    if (typeof cloudinary.config !== 'function') throw new Error('cloudinary.config missing');
});

// ── 4. Project File Structure ───────────────────────────────
log('\n── Project File Structure ─────────────────────', 'cyan');

check('server.js exists', () => {
    if (!fs.existsSync(path.join(__dirname, 'server.js'))) throw new Error('server.js not found');
});

check('App.js exists', () => {
    if (!fs.existsSync(path.join(__dirname, 'App.js'))) throw new Error('App.js not found');
});

check('models folder', () => {
    // Note: models are actually inline in server.js but verify folder if referenced
    if (!fs.existsSync(path.join(__dirname, 'models'))) {
        // Just a warning
        log('  ⚠️  models folder missing (logic might be in server.js)', 'yellow');
    } else {
        log('  ✅ models folder found', 'green');
    }
});

check('public/admin-panel folder', () => {
    if (!fs.existsSync(path.join(__dirname, 'admin-panel'))) {
        log('  ⚠️  admin-panel folder missing', 'yellow');
    } else {
        log('  ✅ admin-panel folder found', 'green');
    }
});

// ── 5. AI Models Existence ──────────────────────────────────
log('\n── AI Models Assets ───────────────────────────', 'cyan');

const modelsDir = path.join(__dirname, 'models');
const requiredModels = [
    'face_landmark_68_model-weights_manifest.json',
    'face_recognition_model-weights_manifest.json',
    'ssd_mobilenetv1_model-weights_manifest.json'
];

if (fs.existsSync(modelsDir)) {
    requiredModels.forEach(m => {
        check(`Model: ${m}`, () => {
            if (!fs.existsSync(path.join(modelsDir, m))) throw new Error(`${m} missing`);
        });
    });
} else {
    log('  ⚠️  models directory does not exist, skipping model checks', 'yellow');
}

// ── Final Report ────────────────────────────────────────────
console.log();
log('╔════════════════════════════════════════╗', 'cyan');
const total = passed + failed;
const color = failed > 0 ? 'red' : 'green';
log(`║  Result: ${passed}/${total} passed             ║`, color);
log('╚════════════════════════════════════════╝', 'cyan');

if (failed > 0) {
    console.log();
    log('⚠️  CRITICAL: Sone dependencies are missing or broken.', 'red');
    log('    Run "npm install" to fix missing modules.', 'yellow');
    log('    For canvas/sharp issues, ensure build tools are installed.', 'yellow');
    process.exit(1);
} else {
    console.log();
    log('🎉 All dependencies verified successfully!', 'green');
    process.exit(0);
}
