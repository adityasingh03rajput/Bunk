/**
 * Patch script to integrate FCM notification service into random ring trigger endpoint
 * 
 * This script updates the notification sending logic in server.js to use
 * the new notificationService module with FCM support.
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

console.log('📝 Reading server.js...');
let serverCode = fs.readFileSync(serverPath, 'utf8');

// Find and replace the notification sending section
const oldCode = `        // Send notifications to students via socket
        let notificationsSent = 0;
        for (const student of targetStudents) {
            try {
                // Emit socket event to student
                io.emit('random_ring_notification', {
                    ringId: randomRing._id.toString(),
                    enrollmentNo: student.enrollmentNo,
                    period: currentPeriod,
                    subject: currentLecture.subject,
                    teacher: teacher.name,
                    expiresAt,
                    message: \`Random verification required for \${currentLecture.subject}\`
                });
                
                // Update notification status
                const studentEntry = randomRing.selectedStudents.find(s => s.enrollmentNo === student.enrollmentNo);
                if (studentEntry) {
                    studentEntry.notificationSent = true;
                    studentEntry.notificationTime = new Date();
                }
                
                notificationsSent++;
            } catch (error) {
                console.error(\`⚠️  Failed to send notification to \${student.enrollmentNo}:\`, error.message);
            }
        }

        await randomRing.save();
        console.log(\`📤 [RANDOM-RING] Sent \${notificationsSent} notifications\`);

        const duration = Date.now() - startTime;
        console.log(\`✅ [RANDOM-RING] Trigger completed in \${duration}ms\`);

        res.json({
            success: true,
            ringId: randomRing._id.toString(),
            targetedStudents: targetStudents.length,
            notificationsSent,
            expiresAt,
            period: currentPeriod,
            subject: currentLecture.subject
        });`;

const newCode = `        // Send push notifications via FCM and socket events as fallback
        let notificationsSent = 0;
        let fcmResults = null;

        try {
            // Send FCM push notifications
            fcmResults = await notificationService.sendRandomRingNotifications(randomRing, targetStudents);
            notificationsSent = fcmResults.sent;
            
            console.log(\`📤 [RANDOM-RING] FCM notifications: \${fcmResults.sent}/\${fcmResults.total} sent\`);
            
            if (fcmResults.failed > 0) {
                console.log(\`⚠️  [RANDOM-RING] FCM failures: \${fcmResults.failed}, Invalid tokens: \${fcmResults.invalidTokens}\`);
            }
        } catch (fcmError) {
            console.error(\`⚠️  [RANDOM-RING] FCM error:\`, fcmError.message);
            console.log(\`📡 [RANDOM-RING] Falling back to socket notifications only\`);
        }

        // Send socket events as fallback/supplement
        for (const student of targetStudents) {
            try {
                // Emit socket event to student
                io.emit('random_ring_notification', {
                    ringId: randomRing._id.toString(),
                    enrollmentNo: student.enrollmentNo,
                    period: currentPeriod,
                    subject: currentLecture.subject,
                    teacher: teacher.name,
                    expiresAt,
                    message: \`Random verification required for \${currentLecture.subject}\`
                });
            } catch (error) {
                console.error(\`⚠️  Failed to send socket notification to \${student.enrollmentNo}:\`, error.message);
            }
        }

        // Save updated notification statuses
        await randomRing.save();
        console.log(\`📤 [RANDOM-RING] Notifications completed\`);

        const duration = Date.now() - startTime;
        console.log(\`✅ [RANDOM-RING] Trigger completed in \${duration}ms\`);

        res.json({
            success: true,
            ringId: randomRing._id.toString(),
            targetedStudents: targetStudents.length,
            notificationsSent,
            notificationsFailed: fcmResults ? fcmResults.failed : 0,
            invalidTokens: fcmResults ? fcmResults.invalidTokens : 0,
            expiresAt,
            period: currentPeriod,
            subject: currentLecture.subject
        });`;

if (serverCode.includes(oldCode)) {
    console.log('✅ Found notification code to replace');
    serverCode = serverCode.replace(oldCode, newCode);
    
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('✅ Successfully patched server.js with FCM notification integration');
    console.log('');
    console.log('Changes made:');
    console.log('  - Integrated notificationService.sendRandomRingNotifications()');
    console.log('  - Added FCM push notification support');
    console.log('  - Kept socket events as fallback');
    console.log('  - Added notification failure tracking');
    console.log('  - Added invalid token tracking');
} else {
    console.log('⚠️  Could not find exact notification code to replace');
    console.log('The code may have already been patched or modified');
}
