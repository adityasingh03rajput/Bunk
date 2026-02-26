/**
 * Surgical fix for server.js - minimal changes only
 */

const fs = require('fs');

console.log('🔧 Surgical fix for server.js...\n');

let content = fs.readFileSync('server.js', 'utf8');

// Backup
fs.writeFileSync('server.js.backup-surgical', content);
console.log('✅ Created backup\n');

// Fix 1: Complete the broken rate limiter at line 1937
// Find: "keyGenerator: (req) => {\n// POST /api/attendance/random-ring/verify"
// Replace with: "keyGenerator: (req) => {\n        return req.body.teacherId || req.ip;\n    },\n    message: { success: false, message: 'Rate limit exceeded. Maximum 5 random rings per hour allowed.' }\n});\n\n// POST /api/attendance/random-ring/verify"

const brokenKeyGen = `    keyGenerator: (req) => {
// POST /api/attendance/random-ring/verify`;

const fixedKeyGen = `    keyGenerator: (req) => {
        return req.body.teacherId || req.ip;
    },
    message: { success: false, message: 'Rate limit exceeded. Maximum 5 random rings per hour allowed.' }
});

// POST /api/attendance/random-ring/verify`;

if (content.includes(brokenKeyGen)) {
    content = content.replace(brokenKeyGen, fixedKeyGen);
    console.log('✅ Fixed broken rate limiter');
} else {
    console.log('⚠️  Broken rate limiter pattern not found');
}

// Fix 2: Remove the corrupted LEGACY marker and the }); after it
// Find: "// ============================================\n// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)\n// ============================================imit exceeded. Maximum 5 random rings per hour allowed.' }\n});"
// Replace with: nothing (remove it)

const corruptedLegacy = `// ============================================
// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)
// ============================================imit exceeded. Maximum 5 random rings per hour allowed.' }
});`;

if (content.includes(corruptedLegacy)) {
    content = content.replace(corruptedLegacy, '');
    console.log('✅ Removed corrupted LEGACY marker');
} else {
    console.log('⚠️  Corrupted LEGACY marker not found');
}

// Fix 3: Remove the duplicate rate limiter at line ~2523
const duplicateRateLimiter = `// Rate limiter for random ring trigger (unlimited rings per hour per teacher)
const randomRingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.body.teacherId || req.ip;
    },
    message: { success: false, message: 'Rate limit exceeded. Maximum 5 random rings per hour allowed.' }
});

`;

if (content.includes(duplicateRateLimiter)) {
    content = content.replace(duplicateRateLimiter, '');
    console.log('✅ Removed duplicate rate limiter');
} else {
    console.log('⚠️  Duplicate rate limiter not found');
}

// Write fixed content
fs.writeFileSync('server.js', content);
console.log('\n✅ Wrote fixed server.js');

// Test syntax
const { execSync } = require('child_process');
try {
    execSync('node -c server.js', { encoding: 'utf8' });
    console.log('✅ Syntax check passed!');
} catch (error) {
    console.log('❌ Syntax error:', error.message);
}

console.log('\nDone!');
