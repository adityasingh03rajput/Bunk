/**
 * Fix Task 4.5 Corruption in server.js
 * 
 * This script fixes the file corruption caused by inserting the verify endpoint
 * in the middle of the rate limiter definition.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Task 4.5 corruption in server.js...\n');

const serverPath = path.join(__dirname, 'server.js');
const verifyEndpointPath = path.join(__dirname, 'verify-endpoint-implementation.js');

// Read files
let serverContent = fs.readFileSync(serverPath, 'utf8');
const verifyEndpointContent = fs.readFileSync(verifyEndpointPath, 'utf8');

console.log('📖 Read server.js and verify-endpoint-implementation.js\n');

// Step 1: Fix the rate limiter
console.log('Step 1: Fixing rate limiter definition...');

const brokenRateLimiter = `// Rate limiter for random ring trigger (5 rings per hour per teacher)
const randomRingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
// POST /api/attendance/random-ring/verify`;

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
});

// POST /api/attendance/random-ring/verify`;

if (serverContent.includes(brokenRateLimiter)) {
    serverContent = serverContent.replace(brokenRateLimiter, fixedRateLimiter);
    console.log('✅ Fixed rate limiter definition\n');
} else {
    console.log('⚠️  Rate limiter pattern not found - may already be fixed\n');
}

// Step 2: Remove the misplaced verify endpoint from within the rate limiter
console.log('Step 2: Removing misplaced verify endpoint...');

// Find the verify endpoint that's in the wrong place
const verifyStartMarker = '// POST /api/attendance/random-ring/verify - Verify random ring response';
const legacyMarker = '// ============================================\n// LEGACY ATTENDANCE TRACKING SYSTEM (DEPRECATED)\n// ============================================';

const verifyStartIndex = serverContent.indexOf(verifyStartMarker);
const legacyIndex = serverContent.indexOf(legacyMarker);

if (verifyStartIndex !== -1 && legacyIndex !== -1 && verifyStartIndex < legacyIndex) {
    // Extract everything between verify start and legacy marker
    const beforeVerify = serverContent.substring(0, verifyStartIndex);
    const afterLegacy = serverContent.substring(legacyIndex);
    
    // Check if there's a broken rate limiter message after legacy marker
    const brokenMessagePattern = /imit exceeded\. Maximum 5 random rings per hour allowed\.' \}\s*\}\);/;
    const cleanedAfterLegacy = afterLegacy.replace(brokenMessagePattern, '');
    
    serverContent = beforeVerify + legacyMarker + cleanedAfterLegacy;
    console.log('✅ Removed misplaced verify endpoint\n');
} else {
    console.log('⚠️  Verify endpoint not found in wrong location\n');
}

// Step 3: Insert verify endpoint in correct location (before LEGACY marker)
console.log('Step 3: Inserting verify endpoint in correct location...');

const correctLegacyIndex = serverContent.indexOf(legacyMarker);
if (correctLegacyIndex !== -1) {
    const beforeLegacy = serverContent.substring(0, correctLegacyIndex);
    const afterLegacy = serverContent.substring(correctLegacyIndex);
    
    // Check if verify endpoint is already there
    if (!beforeLegacy.includes('app.post(\'/api/attendance/random-ring/verify\'')) {
        serverContent = beforeLegacy + '\n' + verifyEndpointContent + '\n\n' + afterLegacy;
        console.log('✅ Inserted verify endpoint before LEGACY section\n');
    } else {
        console.log('⚠️  Verify endpoint already exists in correct location\n');
    }
} else {
    console.log('❌ Could not find LEGACY marker\n');
}

// Step 4: Write fixed content back to server.js
console.log('Step 4: Writing fixed content to server.js...');

// Create backup first
const backupPath = path.join(__dirname, 'server.js.backup-task-4.5');
fs.writeFileSync(backupPath, fs.readFileSync(serverPath, 'utf8'));
console.log(`✅ Created backup: ${backupPath}\n`);

// Write fixed content
fs.writeFileSync(serverPath, serverContent);
console.log('✅ Wrote fixed content to server.js\n');

// Step 5: Verify the fix
console.log('Step 5: Verifying the fix...');

const fixedContent = fs.readFileSync(serverPath, 'utf8');

// Check rate limiter is correct
if (fixedContent.includes('return req.body.teacherId || req.ip;') && 
    fixedContent.includes('message: { success: false, message: \'Rate limit exceeded. Maximum 5 random rings per hour allowed.\' }')) {
    console.log('✅ Rate limiter is correct');
} else {
    console.log('❌ Rate limiter may still have issues');
}

// Check verify endpoint exists before LEGACY
const verifyIndex = fixedContent.indexOf('app.post(\'/api/attendance/random-ring/verify\'');
const legacyIndexFinal = fixedContent.indexOf(legacyMarker);

if (verifyIndex !== -1 && legacyIndexFinal !== -1 && verifyIndex < legacyIndexFinal) {
    console.log('✅ Verify endpoint is in correct location (before LEGACY section)');
} else {
    console.log('❌ Verify endpoint location may be incorrect');
}

// Check for syntax errors (basic check)
try {
    // Count braces
    const openBraces = (fixedContent.match(/{/g) || []).length;
    const closeBraces = (fixedContent.match(/}/g) || []).length;
    
    if (openBraces === closeBraces) {
        console.log('✅ Brace count matches');
    } else {
        console.log(`⚠️  Brace mismatch: ${openBraces} open, ${closeBraces} close`);
    }
} catch (error) {
    console.log('⚠️  Could not verify brace count');
}

console.log('\n' + '='.repeat(60));
console.log('🎉 Fix complete!');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Test server.js for syntax errors: node -c server.js');
console.log('2. Start the server: node server.js');
console.log('3. Test the verify endpoint');
console.log('4. If issues persist, restore from backup: server.js.backup-task-4.5');
console.log('\nBackup location:', backupPath);

