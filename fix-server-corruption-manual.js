/**
 * Manual fix for server.js corruption
 * This script removes the misplaced verify endpoint and fixes the rate limiter
 */

const fs = require('fs');

console.log('🔧 Fixing server.js corruption...\n');

// Read server.js
let content = fs.readFileSync('server.js', 'utf8');

// Create backup
fs.writeFileSync('server.js.backup-before-fix', content);
console.log('✅ Created backup: server.js.backup-before-fix\n');

// Step 1: Find and remove the entire misplaced verify endpoint section
// It starts at "// POST /api/attendance/random-ring/verify - Verify random ring response"
// and ends at the corrupted LEGACY marker

const verifyStartPattern = '// POST /api/attendance/random-ring/verify - Verify random ring response';
const corruptedLegacyPattern = '// ============================================\n// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)\n// ============================================imit exceeded. Maximum 5 random rings per hour allowed.\' }\n});\n\n// POST /api/attendance/random-ring/trigger - Trigger random verification ring';

const verifyStartIndex = content.indexOf(verifyStartPattern);
const corruptedLegacyIndex = content.indexOf(corruptedLegacyPattern);

if (verifyStartIndex === -1) {
    console.log('❌ Could not find verify endpoint start marker');
    process.exit(1);
}

if (corruptedLegacyIndex === -1) {
    console.log('❌ Could not find corrupted LEGACY marker');
    process.exit(1);
}

console.log(`Found verify endpoint at index ${verifyStartIndex}`);
console.log(`Found corrupted LEGACY marker at index ${corruptedLegacyIndex}`);

// Remove everything from verify start to end of corrupted LEGACY marker
const beforeVerify = content.substring(0, verifyStartIndex);
const afterCorruptedLegacy = content.substring(corruptedLegacyIndex + corruptedLegacyPattern.length);

// Now we need to fix the rate limiter that was broken
// The beforeVerify section ends with the broken rate limiter
// We need to complete it properly

const rateLimiterFix = `        return req.body.teacherId || req.ip;
    },
    message: { success: false, message: 'Rate limit exceeded. Maximum 5 random rings per hour allowed.' }
});

`;

content = beforeVerify + rateLimiterFix + afterCorruptedLegacy;

console.log('✅ Removed misplaced verify endpoint and fixed rate limiter\n');

// Step 2: Now insert the verify endpoint in the correct location
// Find the correct LEGACY marker (should be the first one now after our removal)
const correctLegacyPattern = '// ============================================\n// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)\n// ============================================';

const correctLegacyIndex = content.indexOf(correctLegacyPattern);

if (correctLegacyIndex === -1) {
    console.log('❌ Could not find correct LEGACY marker');
    process.exit(1);
}

console.log(`Found correct LEGACY marker at index ${correctLegacyIndex}`);

// Read the verify endpoint implementation
const verifyEndpoint = fs.readFileSync('verify-endpoint-implementation.js', 'utf8');

// Insert verify endpoint before LEGACY marker
const beforeLegacy = content.substring(0, correctLegacyIndex);
const afterLegacy = content.substring(correctLegacyIndex);

content = beforeLegacy + verifyEndpoint + '\n\n' + afterLegacy;

console.log('✅ Inserted verify endpoint in correct location\n');

// Write fixed content
fs.writeFileSync('server.js', content);
console.log('✅ Wrote fixed content to server.js\n');

// Verify
console.log('Verifying fix...');
const fixed = fs.readFileSync('server.js', 'utf8');

// Check rate limiter
if (fixed.includes('return req.body.teacherId || req.ip;')) {
    console.log('✅ Rate limiter is fixed');
} else {
    console.log('❌ Rate limiter may still have issues');
}

// Check verify endpoint location
const verifyIndex = fixed.indexOf('app.post(\'/api/attendance/random-ring/verify\'');
const legacyIndex = fixed.indexOf(correctLegacyPattern);

if (verifyIndex !== -1 && legacyIndex !== -1 && verifyIndex < legacyIndex) {
    console.log('✅ Verify endpoint is in correct location');
} else {
    console.log('❌ Verify endpoint location may be incorrect');
}

console.log('\n✅ Fix complete!');
console.log('\nNext steps:');
console.log('1. Test syntax: node -c server.js');
console.log('2. Start server: node server.js');
console.log('3. Test the verify endpoint');
