/**
 * Simple fix for server.js corruption
 */

const fs = require('fs');

console.log('🔧 Fixing server.js corruption...\n');

// Read files
let content = fs.readFileSync('server.js', 'utf8');
const verifyEndpoint = fs.readFileSync('verify-endpoint-implementation.js', 'utf8');

// Create backup
fs.writeFileSync('server.js.backup-simple-fix', content);
console.log('✅ Created backup\n');

// Split into lines for easier manipulation
const lines = content.split('\n');

// Find the line with the corrupted LEGACY marker
let corruptedLineIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('============================================imit exceeded')) {
        corruptedLineIndex = i;
        break;
    }
}

if (corruptedLineIndex === -1) {
    console.log('❌ Could not find corrupted line');
    process.exit(1);
}

console.log(`Found corrupted line at index ${corruptedLineIndex}: ${lines[corruptedLineIndex].substring(0, 80)}...`);

// Find where the verify endpoint starts (should be before the corrupted line)
let verifyStartIndex = -1;
for (let i = corruptedLineIndex - 1; i >= 0; i--) {
    if (lines[i].includes('// POST /api/attendance/random-ring/verify - Verify random ring response')) {
        verifyStartIndex = i;
        break;
    }
}

if (verifyStartIndex === -1) {
    console.log('❌ Could not find verify endpoint start');
    process.exit(1);
}

console.log(`Found verify endpoint start at line ${verifyStartIndex}`);

// Find where the rate limiter starts (should be before verify endpoint)
let rateLimiterStartIndex = -1;
for (let i = verifyStartIndex - 1; i >= 0; i--) {
    if (lines[i].includes('const randomRingLimiter = rateLimit({')) {
        rateLimiterStartIndex = i - 1; // Include the comment line
        break;
    }
}

if (rateLimiterStartIndex === -1) {
    console.log('❌ Could not find rate limiter start');
    process.exit(1);
}

console.log(`Found rate limiter start at line ${rateLimiterStartIndex}`);

// Find the line after the corrupted section (should be the trigger endpoint)
let afterCorruptionIndex = corruptedLineIndex + 2; // Skip the }); line
while (afterCorruptionIndex < lines.length && lines[afterCorruptionIndex].trim() === '') {
    afterCorruptionIndex++;
}

console.log(`After corruption index: ${afterCorruptionIndex}`);

// Now reconstruct the file
// Part 1: Everything before the rate limiter
const part1 = lines.slice(0, rateLimiterStartIndex).join('\n');

// Part 2: Fixed rate limiter
const fixedRateLimiter = `// Rate limiter for random ring trigger (5 rings per hour per teacher)
const randomRingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.body.teacherId || req.ip;
    },
    message: { success: false, message: 'Rate limit exceeded. Maximum 5 random rings per hour allowed.' }
});`;

// Part 3: Everything after the corruption
const part3 = lines.slice(afterCorruptionIndex).join('\n');

// Reconstruct
content = part1 + '\n\n' + fixedRateLimiter + '\n\n' + part3;

console.log('✅ Removed misplaced verify endpoint and fixed rate limiter\n');

// Now find the correct LEGACY marker and insert verify endpoint before it
const correctLegacyMarker = '// ============================================\n// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)\n// ============================================';

const legacyIndex = content.indexOf(correctLegacyMarker);

if (legacyIndex === -1) {
    console.log('❌ Could not find correct LEGACY marker');
    process.exit(1);
}

console.log('Found correct LEGACY marker');

// Insert verify endpoint before LEGACY marker
const beforeLegacy = content.substring(0, legacyIndex);
const afterLegacy = content.substring(legacyIndex);

content = beforeLegacy + verifyEndpoint + '\n\n' + afterLegacy;

console.log('✅ Inserted verify endpoint in correct location\n');

// Write fixed content
fs.writeFileSync('server.js', content);
console.log('✅ Wrote fixed server.js\n');

// Verify
console.log('Verifying...');
const fixed = fs.readFileSync('server.js', 'utf8');

if (fixed.includes('return req.body.teacherId || req.ip;')) {
    console.log('✅ Rate limiter is fixed');
}

const verifyIndex = fixed.indexOf('app.post(\'/api/attendance/random-ring/verify\'');
const legacyIdx = fixed.indexOf(correctLegacyMarker);

if (verifyIndex !== -1 && legacyIdx !== -1 && verifyIndex < legacyIdx) {
    console.log('✅ Verify endpoint is in correct location');
}

console.log('\n✅ Fix complete!');
