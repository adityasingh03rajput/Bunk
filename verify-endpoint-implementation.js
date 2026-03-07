// POST /api/attendance/random-ring/verify - Verify random ring response
app.post('/api/attendance/random-ring/verify', async (req, res) => {
    const startTime = Date.now();
    const { ringId, enrollmentNo, faceEmbedding, wifiBSSID, timestamp } = req.body;
    
    console.log(`🔍 [RANDOM-RING-VERIFY] Verification attempt - Ring: ${ringId}, Student: ${enrollmentNo}, IP: ${req.ip}`);
    
    try {
        // 1. Validate request body
        if (!ringId || !enrollmentNo || !faceEmbedding || !wifiBSSID || !timestamp) {
            const missingFields = [];
            if (!ringId) missingFields.push('ringId');
            if (!enrollmentNo) missingFields.push('enrollmentNo');
            if (!faceEmbedding) missingFields.push('faceEmbedding');
            if (!wifiBSSID) missingFields.push('wifiBSSID');
            if (!timestamp) missingFields.push('timestamp');
            
            console.log(`❌ [RANDOM-RING-VERIFY] Missing required fields: ${missingFields.join(', ')}`);
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missingFields
            });
        }

        // Validate faceEmbedding is an array
        if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
            console.log(`❌ [RANDOM-RING-VERIFY] Invalid faceEmbedding format`);
            return res.status(400).json({
                success: false,
                error: 'faceEmbedding must be a non-empty array of numbers'
            });
        }

        // 2. Find the random ring
        const randomRing = await RandomRing.findOne({ ringId });
        if (!randomRing) {
            console.log(`❌ [RANDOM-RING-VERIFY] Ring not found: ${ringId}`);
            return res.status(404).json({
                success: false,
                error: 'Random ring not found'
            });
        }

        // 3. Validate ring is active and not expired
        if (randomRing.status === 'expired') {
            console.log(`❌ [RANDOM-RING-VERIFY] Ring expired: ${ringId}`);
            return res.status(410).json({
                success: false,
                error: 'Random ring has expired',
                expiresAt: randomRing.expiresAt
            });
        }

        if (randomRing.status === 'completed') {
            console.log(`❌ [RANDOM-RING-VERIFY] Ring already completed: ${ringId}`);
            return res.status(410).json({
                success: false,
                error: 'Random ring has been completed'
            });
        }

        // Check expiration time (10 minutes from trigger)
        const now = new Date(timestamp);
        if (now > randomRing.expiresAt) {
            // Mark ring as expired
            randomRing.status = 'expired';
            await randomRing.save();
            
            console.log(`❌ [RANDOM-RING-VERIFY] Ring expired: ${ringId}`);
            return res.status(410).json({
                success: false,
                error: 'Random ring has expired',
                expiresAt: randomRing.expiresAt
            });
        }

        // 4. Verify student is in the targeted students list
        const studentResponse = randomRing.selectedStudents.find(
            s => s.enrollmentNo === enrollmentNo
        );

        if (!studentResponse) {
            console.log(`❌ [RANDOM-RING-VERIFY] Student not in ring: ${enrollmentNo}`);
            return res.status(404).json({
                success: false,
                error: 'Student not found in this random ring'
            });
        }

        // Check if student already responded
        if (studentResponse.responded) {
            console.log(`⚠️  [RANDOM-RING-VERIFY] Student already responded: ${enrollmentNo}`);
            return res.status(400).json({
                success: false,
                error: 'You have already responded to this random ring',
                previousResponse: {
                    verified: studentResponse.verified,
                    responseTime: studentResponse.responseTime,
                    faceVerified: studentResponse.faceVerified,
                    wifiVerified: studentResponse.wifiVerified
                }
            });
        }

        // 5. Get student information
        const student = await StudentManagement.findOne({ enrollmentNo });
        if (!student) {
            console.log(`❌ [RANDOM-RING-VERIFY] Student not found: ${enrollmentNo}`);
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        // 6. Perform face verification
        const { verifyStudentFace } = require('./services/faceVerificationService');
        const faceVerificationResult = verifyStudentFace(student, faceEmbedding, 0.6);
        
        console.log(`🔍 [RANDOM-RING-VERIFY] Face verification - Student: ${enrollmentNo}, Match: ${faceVerificationResult.isMatch}, Similarity: ${faceVerificationResult.similarity}`);

        // 7. Perform WiFi verification
        const { verifyClassroomWiFi } = require('./services/wifiVerificationService');
        
        // Get classroom from random ring room
        const classroom = await Classroom.findOne({ roomNumber: randomRing.room });
        const wifiVerificationResult = verifyClassroomWiFi(wifiBSSID, classroom);
        
        console.log(`📡 [RANDOM-RING-VERIFY] WiFi verification - Student: ${enrollmentNo}, Match: ${wifiVerificationResult.isMatch}, Room: ${randomRing.room}`);

        // 8. Determine verification success (both must pass)
        const verified = faceVerificationResult.isMatch && wifiVerificationResult.isMatch;
        const faceVerified = faceVerificationResult.isMatch;
        const wifiVerified = wifiVerificationResult.isMatch;

        // 9. Get current period and lecture info
        const lectureInfo = await getCurrentLectureInfo(randomRing.semester, randomRing.branch);
        const currentPeriod = lectureInfo ? `P${lectureInfo.period}` : randomRing.period;

        // 10. Update attendance based on verification result
        const today = new Date(timestamp);
        today.setHours(0, 0, 0, 0);

        let markedPeriods = [];

        if (verified) {
            // SUCCESS CASE: Mark student present for current period and all future periods
            console.log(`✅ [RANDOM-RING-VERIFY] Verification successful - Student: ${enrollmentNo}, Period: ${currentPeriod}`);

            // Get all periods from timetable
            const timetable = await Timetable.findOne({ 
                semester: randomRing.semester, 
                branch: randomRing.branch 
            });

            if (timetable) {
                const currentPeriodNum = parseInt(currentPeriod.substring(1));
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = days[now.getDay()];
                const daySchedule = timetable.timetable[currentDay];

                // Mark present for current period onwards
                for (let i = currentPeriodNum - 1; i < daySchedule.length; i++) {
                    const periodData = daySchedule[i];
                    if (periodData && !periodData.isBreak) {
                        const periodId = `P${i + 1}`;
                        markedPeriods.push(periodId);

                        // Create or update PeriodAttendance record
                        await PeriodAttendance.findOneAndUpdate(
                            {
                                enrollmentNo,
                                date: today,
                                period: periodId
                            },
                            {
                                enrollmentNo,
                                studentName: student.name,
                                date: today,
                                period: periodId,
                                subject: periodData.subject,
                                teacher: periodData.teacher,
                                teacherName: periodData.teacherName,
                                room: periodData.room,
                                status: 'present',
                                checkInTime: now,
                                verificationType: 'random',
                                wifiVerified: true,
                                faceVerified: true,
                                wifiBSSID: wifiBSSID
                            },
                            { upsert: true, new: true }
                        );
                    }
                }
            }

            // Update RandomRing response
            studentResponse.responded = true;
            studentResponse.verified = true;
            studentResponse.responseTime = now;
            studentResponse.faceVerified = true;
            studentResponse.wifiVerified = true;

            // Increment successful verifications counter
            randomRing.successfulVerifications = (randomRing.successfulVerifications || 0) + 1;

        } else {
            // FAILURE CASE: Mark student absent for current period ONLY
            console.log(`❌ [RANDOM-RING-VERIFY] Verification failed - Student: ${enrollmentNo}, Period: ${currentPeriod}, Face: ${faceVerified}, WiFi: ${wifiVerified}`);

            // Get period data from timetable
            const timetable = await Timetable.findOne({ 
                semester: randomRing.semester, 
                branch: randomRing.branch 
            });

            if (timetable) {
                const currentPeriodNum = parseInt(currentPeriod.substring(1));
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const currentDay = days[now.getDay()];
                const daySchedule = timetable.timetable[currentDay];
                const periodData = daySchedule[currentPeriodNum - 1];

                if (periodData && !periodData.isBreak) {
                    markedPeriods.push(currentPeriod);

                    // Create or update PeriodAttendance record for current period only
                    await PeriodAttendance.findOneAndUpdate(
                        {
                            enrollmentNo,
                            date: today,
                            period: currentPeriod
                        },
                        {
                            enrollmentNo,
                            studentName: student.name,
                            date: today,
                            period: currentPeriod,
                            subject: periodData.subject,
                            teacher: periodData.teacher,
                            teacherName: periodData.teacherName,
                            room: periodData.room,
                            status: 'absent',
                            checkInTime: now,
                            verificationType: 'random',
                            wifiVerified: wifiVerified,
                            faceVerified: faceVerified,
                            wifiBSSID: wifiBSSID
                        },
                        { upsert: true, new: true }
                    );
                }
            }

            // Update RandomRing response
            studentResponse.responded = true;
            studentResponse.verified = false;
            studentResponse.responseTime = now;
            studentResponse.faceVerified = faceVerified;
            studentResponse.wifiVerified = wifiVerified;

            // Increment failed verifications counter
            randomRing.failedVerifications = (randomRing.failedVerifications || 0) + 1;
        }

        // Update total responses counter
        randomRing.totalResponses = (randomRing.totalResponses || 0) + 1;

        // Save RandomRing updates
        await randomRing.save();

        // 11. Broadcast status update to teacher via WebSocket
        if (io) {
            io.to(`teacher_${randomRing.teacherId}`).emit('random_ring_response', {
                ringId: randomRing.ringId,
                enrollmentNo,
                studentName: student.name,
                verified,
                faceVerified,
                wifiVerified,
                responseTime: now,
                totalResponses: randomRing.totalResponses,
                successfulVerifications: randomRing.successfulVerifications,
                failedVerifications: randomRing.failedVerifications,
                targetedStudents: randomRing.selectedStudents.length
            });
        }

        // 12. Send response
        const duration = Date.now() - startTime;
        console.log(`✅ [RANDOM-RING-VERIFY] Completed in ${duration}ms - Student: ${enrollmentNo}, Verified: ${verified}`);

        return res.json({
            success: true,
            verified,
            currentPeriod,
            markedPeriods,
            faceVerified,
            wifiVerified,
            message: verified 
                ? `Verification successful. Marked present for ${markedPeriods.length} period(s).`
                : `Verification failed. Marked absent for current period. ${!faceVerified ? 'Face verification failed. ' : ''}${!wifiVerified ? 'WiFi verification failed.' : ''}`,
            details: {
                faceVerification: {
                    success: faceVerified,
                    similarity: faceVerificationResult.similarity,
                    message: faceVerificationResult.message
                },
                wifiVerification: {
                    success: wifiVerified,
                    capturedBSSID: wifiBSSID,
                    authorizedBSSID: classroom ? classroom.wifiBSSID : null,
                    message: wifiVerificationResult.message
                }
            }
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [RANDOM-RING-VERIFY] Error after ${duration}ms:`, error);
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error during verification',
            message: error.message
        });
    }
});
