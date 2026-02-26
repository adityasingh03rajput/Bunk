
        await randomRing.save();
        console.log(`✅ [RANDOM-RING] Created ring record: ${randomRing._id}`);

        // Send push notifications via FCM and socket events as fallback
        let notificationsSent = 0;
        let fcmResults = null;

        try {
            // Send FCM push notifications
            fcmResults = await notificationService.sendRandomRingNotifications(randomRing, targetStudents);
            notificationsSent = fcmResults.sent;
            
            console.log(`📤 [RANDOM-RING] FCM notifications: ${fcmResults.sent}/${fcmResults.total} sent`);
            
            if (fcmResults.failed > 0) {
                console.log(`⚠️  [RANDOM-RING] FCM failures: ${fcmResults.failed}, Invalid tokens: ${fcmResults.invalidTokens}`);
            }
        } catch (fcmError) {
            console.error(`⚠️  [RANDOM-RING] FCM error:`, fcmError.message);
            console.log(`📡 [RANDOM-RING] Falling back to socket notifications only`);
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
                    message: `Random verification required for ${currentLecture.subject}`
                });
            } catch (error) {
                console.error(`⚠️  Failed to send socket notification to ${student.enrollmentNo}:`, error.message);
            }
        }

        // Save updated notification statuses
        await randomRing.save();
        console.log(`📤 [RANDOM-RING] Notifications completed`);

        const duration = Date.now() - startTime;
        console.log(`✅ [RANDOM-RING] Trigger completed in ${duration}ms`);

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
        });
