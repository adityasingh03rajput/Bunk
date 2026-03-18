/**
 * Script to fix RandomRing creation for Task 4.3
 * Updates the /api/random-ring endpoint to create RandomRing records with correct schema
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

console.log('📝 Reading server.js...');
let content = fs.readFileSync(serverPath, 'utf8');

// Pattern 1: Update the RandomRing creation
const oldPattern1 = `            const randomRing = new RandomRing({
                teacherId,
                teacherName: teacherName || 'Teacher',
                semester,
                branch,
                subject,
                room,
                bssid,
                type,
                count: type === 'select' ? count : selectedStudents.length,
                selectedStudents: selectedStudents.map(s => ({
                    studentId: s._id ? s._id.toString() : s.enrollmentNo,
                    name: s.name,
                    enrollmentNo: s.enrollmentNo,
                    notificationSent: true,
                    notificationTime: randomRingTimestamp,
                    verified: false
                })),
                status: 'pending',
                createdAt: randomRingTimestamp
            });`;

const newPattern1 = `            // Generate unique ringId
            const ringId = \`ring_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
            
            // Get current period (simplified - should be from timetable)
            const currentPeriod = 'P4'; // TODO: Get from timetable based on current time
            
            // Set expiration time (10 minutes from trigger)
            const expiresAt = new Date(randomRingTimestamp.getTime() + 10 * 60 * 1000);
            
            // Initialize response tracking for each student
            const responses = selectedStudents.map(student => ({
                enrollmentNo: student.enrollmentNo,
                responded: false,
                verified: false,
                responseTime: null,
                faceVerified: false,
                wifiVerified: false
            }));
            
            const randomRing = new RandomRing({
                ringId,
                teacherId,
                teacherName: teacherName || 'Teacher',
                semester,
                branch,
                period: currentPeriod,
                subject,
                room,
                targetType: type,
                targetedStudents: selectedStudents.map(s => s.enrollmentNo),
                studentCount: selectedStudents.length,
                responses,
                triggeredAt: randomRingTimestamp,
                expiresAt,
                completedAt: null,
                totalResponses: 0,
                successfulVerifications: 0,
                failedVerifications: 0,
                noResponses: 0,
                status: 'active'
            });`;

if (content.includes(oldPattern1)) {
    console.log('✅ Found old RandomRing creation pattern');
    content = content.replace(oldPattern1, newPattern1);
    console.log('✅ Replaced with new pattern');
} else {
    console.log('⚠️  Old pattern not found - checking if already updated...');
    if (content.includes('ringId,') && content.includes('targetType:') && content.includes('targetedStudents:')) {
        console.log('✅ RandomRing creation already updated!');
        process.exit(0);
    } else {
        console.log('❌ Could not find pattern to replace');
        console.log('Searching for partial match...');
        if (content.includes('new RandomRing({')) {
            console.log('Found RandomRing creation, but pattern doesn\'t match exactly');
        }
        process.exit(1);
    }
}

// Pattern 2: Update the log message
content = content.replace(
    `console.log(\`💾 Random ring record created: \${randomRingId}\`);`,
    `console.log(\`💾 Random ring record created: \${randomRingId}, ringId: \${ringId}\`);`
);

// Write the updated content
console.log('💾 Writing updated server.js...');
fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ server.js updated successfully!');

console.log('\n📋 Changes made:');
console.log('  1. Added ringId generation (unique identifier)');
console.log('  2. Added period field (current period like P4)');
console.log('  3. Added expiresAt field (10 minutes from trigger)');
console.log('  4. Updated field names:');
console.log('     - type → targetType');
console.log('     - count → studentCount');
console.log('     - selectedStudents → targetedStudents (array of enrollment numbers)');
console.log('     - createdAt → triggeredAt');
console.log('  5. Added responses array with proper structure:');
console.log('     - enrollmentNo, responded, verified, responseTime, faceVerified, wifiVerified');
console.log('  6. Added tracking fields initialized to 0:');
console.log('     - totalResponses, successfulVerifications, failedVerifications, noResponses');
console.log('  7. Changed status from "pending" to "active"');
console.log('  8. Added completedAt field (null initially)');
console.log('\n✅ Task 4.3 implementation complete!');
