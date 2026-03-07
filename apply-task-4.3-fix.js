/**
 * Apply Task 4.3 fix to server.js
 * Updates RandomRing creation to match schema requirements
 */

const fs = require('fs');

console.log('📝 Reading server.js...');
let content = fs.readFileSync('server.js', 'utf8');

// Find the RandomRing creation and replace it
const searchStart = 'if (mongoose.connection.readyState === 1) {\n            const randomRing = new RandomRing({';
const searchEnd = '            });\n\n            await randomRing.save();';

const startIdx = content.indexOf(searchStart);
if (startIdx === -1) {
    console.log('❌ Could not find RandomRing creation start');
    process.exit(1);
}

const endIdx = content.indexOf(searchEnd, startIdx);
if (endIdx === -1) {
    console.log('❌ Could not find RandomRing creation end');
    process.exit(1);
}

console.log(`✅ Found RandomRing creation at position ${startIdx} to ${endIdx}`);

// Extract the old code
const oldCode = content.substring(startIdx, endIdx + searchEnd.length);
console.log('\n📋 Old code length:', oldCode.length, 'characters');

// New code with Task 4.3 requirements
const newCode = `if (mongoose.connection.readyState === 1) {
            // Generate unique ringId
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
            });

            await randomRing.save();`;

// Replace
content = content.substring(0, startIdx) + newCode + content.substring(endIdx + searchEnd.length);

// Also update the log message
content = content.replace(
    `console.log(\`💾 Random ring record created: \${randomRingId}\`);`,
    `console.log(\`💾 Random ring record created: \${randomRingId}, ringId: \${ringId}\`);`
);

// Write back
console.log('💾 Writing updated server.js...');
fs.writeFileSync('server.js', content, 'utf8');
console.log('✅ server.js updated successfully!');

console.log('\n📋 Task 4.3 Changes Applied:');
console.log('  ✅ Added ringId generation');
console.log('  ✅ Added period field');
console.log('  ✅ Added expiresAt (10 minutes)');
console.log('  ✅ Updated field names (type→targetType, count→studentCount, etc.)');
console.log('  ✅ Added responses array with proper structure');
console.log('  ✅ Added tracking fields (totalResponses, successfulVerifications, etc.)');
console.log('  ✅ Changed status to "active"');
console.log('  ✅ Added completedAt field');
