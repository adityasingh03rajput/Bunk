/**
 * Final fix for server.js corruption
 */

const fs = require('fs');

console.log('🔧 Fixing server.js corruption...\n');

// Read files
let content = fs.readFileSync('server.js', 'utf8');
const verifyEndpoint = fs.readFileSync('verify-endpoint-implementation.js', 'utf8');

// Create backup
const backupName = `server.js.backup-${Date.now()}`;
fs.writeFileSync(backupName, content);
console.log(`✅ Created backup: ${backupName}\n`);

// Step 1: Find all LEGACY markers
const legacyPattern = /\/\/ ============================================\s*\n\/\/ LEGACY ATTENDANCE TRACKING SYSTEM \(DEPRECATED\)\s*\n\/\/ ============================================/g;

const matches = [];
let match;
while ((match = legacyPattern.exec(content)) !== null) {
    matches.push({
        index: match.index,
        text: match[0],
        isCorrupted: content.substring(match.index, match.index + 200).includes('imit exceeded')
    });
}

console.log(`Found ${matches.length} LEGACY markers:`);
matches.forEach((m, i) => {
    console.log(`  ${i + 1}. At index ${m.index}, corrupted: ${m.isCorrupted}`);
});

if (matches.length !== 2) {
    console.log('⚠️  Expected 2 LEGACY markers, found', matches.length);
}

// Find the corrupted one and the correct one
const corruptedMarker = matches.find(m => m.isCorrupted);
const correctMarker = matches.find(m => !m.isCorrupted);

if (!corruptedMarker) {
    console.log('❌ Could not find corrupted LEGACY marker');
    process.exit(1);
}

if (!correctMarker) {
    console.log('❌ Could not find correct LEGACY marker');
    process.exit(1);
}

console.log(`\nCorrupted marker at index: ${corruptedMarker.index}`);
console.log(`Correct marker at index: ${correctMarker.index}\n`);

// Step 2: Find the verify endpoint start (should be before corrupted marker)
const verifyPattern = /\/\/ POST \/api\/attendance\/random-ring\/verify - Verify random ring response/;
const verifyMatch = verifyPattern.exec(content);

if (!verifyMatch || verifyMatch.index >= corruptedMarker.index) {
    console.log('❌ Could not find verify endpoint in expected location');
    process.exit(1);
}

console.log(`Found verify endpoint at index: ${verifyMatch.index}`);

// Step 3: Find the rate limiter start (should be before verify endpoint)
const rateLimiterPattern = /\/\/ Rate limiter for random ring trigger \(\d+ rings per hour per teacher\)\s*\nconst randomRingLimiter = rateLimit\(\{/;
const rateLimiterMatch = rateLimiterPattern.exec(content);

if (!rateLimiterMatch || rateLimiterMatch.index >= verifyMatch.index) {
    console.log('❌ Could not find rate limiter in expected location');
    process.exit(1);
}

console.log(`Found rate limiter at index: ${rateLimiterMatch.index}\n`);

// Step 4: Remove everything from rate limiter keyGenerator to end of corrupted LEGACY section
// Find the end of the corrupted section (the }); after the corrupted LEGACY marker)
const afterCorruptedIndex = content.indexOf('});', corruptedMarker.index) + 4;

// Find where the keyGenerator line starts
const keyGenIndex = content.indexOf('keyGenerator: (req) => {', rateLimiterMatch.index);

if (keyGenIndex === -1) {
    console.log('❌ Could not find keyGenerator');
    process.exit(1);
}

console.log(`Removing content from index ${keyGenIndex} to ${afterCorruptedIndex}`);

// Reconstruct: before keyGenerator + fixed keyGenerator + after corrupted section
const beforeKeyGen = content.substring(0, keyGenIndex);
const afterCorrupted = content.substring(afterCorruptedIndex);

const fixedKeyGen = `keyGenerator: (req) => {
        return req.body.teacherId || req.ip;
    },
    message: { success: false, message: 'Rate limit exceeded. Maximum 5 random rings per hour allowed.' }
});

`;

content = beforeKeyGen + fixedKeyGen + afterCorrupted;

console.log('✅ Removed misplaced verify endpoint and fixed rate limiter\n');

// Step 5: Insert verify endpoint before the correct LEGACY marker
// Use regex to find it since the exact format might vary
const legacyMarkerRegex = /\/\/ ============================================\s*\n\/\/ LEGACY ATTENDANCE TRACKING SYSTEM \(DEPRECATED\)\s*\n\/\/ ============================================/;
const legacyMarkerMatch = legacyMarkerRegex.exec(content);

if (!legacyMarkerMatch) {
    console.log('❌ Could not find LEGACY marker after fix');
    process.exit(1);
}

const newCorrectMarkerIndex = legacyMarkerMatch.index;
console.log(`Found LEGACY marker at index: ${newCorrectMarkerIndex}`);

const beforeLegacy = content.substring(0, newCorrectMarkerIndex);
const afterLegacy = content.substring(newCorrectMarkerIndex);

content = beforeLegacy + verifyEndpoint + '\n\n' + afterLegacy;

console.log('✅ Inserted verify endpoint before LEGACY marker\n');

// Write fixed content
fs.writeFileSync('server.js', content);
console.log('✅ Wrote fixed server.js\n');

// Verify
console.log('Verifying fix...');
const fixed = fs.readFileSync('server.js', 'utf8');

// Check rate limiter
if (fixed.includes('return req.body.teacherId || req.ip;')) {
    console.log('✅ Rate limiter is fixed');
} else {
    console.log('❌ Rate limiter may have issues');
}

// Check verify endpoint location
const verifyIdx = fixed.indexOf('app.post(\'/api/attendance/random-ring/verify\'');
const legacyIdx = fixed.indexOf('// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)');

if (verifyIdx !== -1 && legacyIdx !== -1 && verifyIdx < legacyIdx) {
    console.log('✅ Verify endpoint is before LEGACY marker');
} else {
    console.log('❌ Verify endpoint location may be incorrect');
}

// Check for corrupted LEGACY marker
if (fixed.includes('============================================imit exceeded')) {
    console.log('❌ Corrupted LEGACY marker still exists');
} else {
    console.log('✅ No corrupted LEGACY marker found');
}

console.log('\n✅ Fix complete!');
console.log('\nNext steps:');
console.log('1. Test syntax: node -c server.js');
console.log('2. Start server: node server.js');
