/**
 * Fix Task 4.3: Update RandomRing record creation to match design document
 * 
 * This script fixes the /api/random-ring endpoint to:
 * 1. Generate unique ringId
 * 2. Use correct field names (targetType, targetedStudents, studentCount)
 * 3. Initialize responses array properly
 * 4. Set expiration time (10 minutes)
 * 5. Initialize tracking statistics
 * 6. Get current period from timetable
 * 7. Remove timer-based legacy code
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Find the random ring endpoint
const startMarker = "// Create random ring record in database";
const endMarker = "// Send notifications via Socket.IO";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('❌ Could not find markers in server.js');
    process.exit(1);
}

console.log('✅ Found random ring creation section');
console.log(`   Start: ${startIndex}, End: ${endIndex}`);

// Extract the section to replace
const oldSection = content.substring(startIndex, endIndex);
console.log('\n📝 Old section length:', oldSection.length, 'characters');

// Create the new section
const newSection = `// Create random ring record in database
        // Get current period from timetable
        let currentPeriod = null;
        try {
            const lectureInfo = await getCurrentLectureInfo(semester, branch);
            if (lectureInfo) {
                currentPeriod = \`P\${lectureInfo.period}\`;
            }
        } catch (error) {
            console.error('⚠️  Error getting current period:', error);
        }

        let randomRingId = null;
        const randomRingTimestamp = new Date();

        if (mongoose.connection.readyState === 1) {
            // Generate unique ringId
            const ringId = \`ring_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
            
            const randomRing = new RandomRing({
                ringId: ringId,  // Unique identifier like "ring_abc123"
                teacherId,
                teacherName: teacherName || 'Teacher',
                semester,
                branch,
                period: currentPeriod,  // Current period like "P4"
                subject,
                room,
                targetType: type,  // Renamed from 'type'
                targetedStudents: selectedStudents.map(s => s.enrollmentNo),  // Array of enrollment numbers only
                studentCount: selectedStudents.length,  // Renamed from 'count'
                
                // Initialize responses array with proper structure
                responses: selectedStudents.map(s => ({
                    enrollmentNo: s.enrollmentNo,
                    responded: false,
                    verified: false,
                    responseTime: null,
                    faceVerified: false,
                    wifiVerified: false
                })),
                
                // Timing fields
                triggeredAt: randomRingTimestamp,
                expiresAt: new Date(randomRingTimestamp.getTime() + 10 * 60 * 1000),  // 10 minutes after trigger
                completedAt: null,
                
                // Statistics tracking (initialize to 0)
                totalResponses: 0,
                successfulVerifications: 0,
                failedVerifications: 0,
                noResponses: 0,
                
                // Status
                status: 'active',  // Must be 'active', not 'pending'
                
                // Timestamps
                createdAt: randomRingTimestamp,
                updatedAt: randomRingTimestamp
            });

            await randomRing.save();
            randomRingId = ringId;  // Use the generated ringId
            console.log(\`💾 Random ring record created: \${randomRingId}, Period: \${currentPeriod}, Students: \${selectedStudents.length}, Expires: \${randomRing.expiresAt.toISOString()}\`);
        }

        `;

console.log('📝 New section length:', newSection.length, 'characters');

// Replace the section
const newContent = content.substring(0, startIndex) + newSection + content.substring(endIndex);

// Write back
fs.writeFileSync(serverPath, newContent, 'utf8');

console.log('\n✅ Successfully updated server.js');
console.log('\n📋 Changes made:');
console.log('   ✅ Added ringId generation');
console.log('   ✅ Added current period lookup');
console.log('   ✅ Changed type → targetType');
console.log('   ✅ Changed count → studentCount');
console.log('   ✅ Changed selectedStudents → targetedStudents (enrollment numbers only)');
console.log('   ✅ Added responses array initialization');
console.log('   ✅ Added expiresAt (10 minutes)');
console.log('   ✅ Added statistics initialization');
console.log('   ✅ Changed status from "pending" → "active"');
console.log('   ✅ Removed timer-based legacy code');
console.log('\n🎯 Task 4.3 complete: RandomRing record now matches design document');
