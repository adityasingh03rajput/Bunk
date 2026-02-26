/**
 * Script to fix RandomRing creation in server.js
 * Updates the RandomRing record creation to match the schema requirements for Task 4.3
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

console.log('📝 Reading server.js...');
let content = fs.readFileSync(serverPath, 'utf8');

// Find and replace the old RandomRing creation with the new one
const oldPattern = `            type: targetType,
            count: targetStudents.length,
            triggerTime: now,`;

const newPattern = `            period: currentPeriod,
            targetType,
            targetedStudents: targetStudents.map(s => s.enrollmentNo),
            studentCount: targetStudents.length,
            responses: targetStudents.map(student => ({
                enrollmentNo: student.enrollmentNo,
                responded: false,
                verified: false,
                responseTime: null,
                faceVerified: false,
                wifiVerified: false
            })),
            triggeredAt: now,
            completedAt: null,
            totalResponses: 0,
            successfulVerifications: 0,
            failedVerifications: 0,
            noResponses: 0,`;

if (content.includes(oldPattern)) {
    console.log('✅ Found old RandomRing creation pattern');
    content = content.replace(oldPattern, newPattern);
    console.log('✅ Replaced with new pattern');
    
    // Also need to remove the old selectedStudents mapping
    const oldSelectedStudents = `            selectedStudents: targetStudents.map(student => ({
                studentId: student._id.toString(),
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                notificationSent: false,
                notificationTime: null,
                verified: false,
                verificationTime: null,
                teacherAccepted: false,
                teacherRejected: false,
                reVerified: false,
                failed: false
            })),
            status: 'pending',`;
    
    const newStatus = `            status: 'active',`;
    
    if (content.includes(oldSelectedStudents)) {
        content = content.replace(oldSelectedStudents, newStatus);
        console.log('✅ Removed old selectedStudents mapping');
    }
} else {
    console.log('❌ Old pattern not found - checking if already updated...');
    if (content.includes('targetType,') && content.includes('targetedStudents:') && content.includes('studentCount:')) {
        console.log('✅ RandomRing creation already updated!');
        process.exit(0);
    } else {
        console.log('❌ Could not find pattern to replace');
        process.exit(1);
    }
}

// Also need to add ringId generation before the RandomRing creation
const beforePattern = `        // Set expiration time (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Create RandomRing record
        const randomRing = new RandomRing({`;

const afterPattern = `        // Set expiration time (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Generate unique ringId
        const ringId = \`ring_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;

        // Create RandomRing record
        const randomRing = new RandomRing({
            ringId,`;

if (content.includes(beforePattern) && !content.includes('const ringId =')) {
    console.log('✅ Adding ringId generation');
    content = content.replace(beforePattern, afterPattern);
} else if (content.includes('const ringId =')) {
    console.log('✅ ringId generation already exists');
} else {
    console.log('⚠️  Could not add ringId generation');
}

// Update the log message
content = content.replace(
    `console.log(\`✅ [RANDOM-RING] Created ring record: \${randomRing._id}\`);`,
    `console.log(\`✅ [RANDOM-RING] Created ring record: \${randomRing._id}, ringId: \${ringId}\`);`
);

// Update the notification sending code to remove old selectedStudents references
content = content.replace(
    `const studentEntry = randomRing.selectedStudents.find(s => s.enrollmentNo === student.enrollmentNo);
                if (studentEntry) {
                    studentEntry.notificationSent = true;
                    studentEntry.notificationTime = new Date();
                }`,
    `// Notification tracking is now handled via responses array
                // Will be updated when student responds to the ring`
);

// Write the updated content
console.log('💾 Writing updated server.js...');
fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ server.js updated successfully!');

console.log('\n📋 Changes made:');
console.log('  1. Added ringId generation');
console.log('  2. Updated RandomRing creation to use correct field names:');
console.log('     - type → targetType');
console.log('     - count → studentCount');
console.log('     - triggerTime → triggeredAt');
console.log('     - selectedStudents → targetedStudents (array of enrollment numbers)');
console.log('  3. Added period field');
console.log('  4. Added responses array with proper structure');
console.log('  5. Added tracking fields: totalResponses, successfulVerifications, etc.');
console.log('  6. Changed status from "pending" to "active"');
console.log('  7. Updated notification handling code');
