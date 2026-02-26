// Script to remove timer-related code from App.js (Task 8.3 & 8.4)
const fs = require('fs');

console.log('🧹 Starting App.js Timer Cleanup (Task 8.3 & 8.4)');
console.log('='.repeat(60));

try {
    // Read App.js
    let content = fs.readFileSync('App.js', 'utf8');
    const originalLength = content.length;
    
    console.log('📄 Original file size:', originalLength, 'bytes');
    
    // 1. Remove CircularTimer import
    console.log('\n1️⃣ Removing CircularTimer import...');
    content = content.replace(/import CircularTimer from '\.\/CircularTimer';\n/g, '');
    
    // 2. Remove useUnifiedTimer import
    console.log('2️⃣ Removing useUnifiedTimer import...');
    content = content.replace(/\/\/ SECURITY FIX: Import unified timer manager\n/g, '');
    content = content.replace(/import { useUnifiedTimer } from '\.\/UnifiedTimerManager';\n/g, '');
    
    // 3. Remove timer state variables
    console.log('3️⃣ Removing timer state variables...');
    
    // Remove isRunning state
    content = content.replace(/const \[isRunning, setIsRunning\] = useState\(false\);\n/g, '');
    
    // Remove serverTimerData state (multi-line)
    content = content.replace(/  \/\/ Centralized timer data from server \(single source of truth\)\n  const \[serverTimerData, setServerTimerData\] = useState\({[\s\S]*?}\);\n\n/g, '');
    
    // Remove displayTime state
    content = content.replace(/  \/\/ Local timer display - increments every second when running\n  const \[displayTime, setDisplayTime\] = useState\(0\);\n\n/g, '');
    
    // Remove uiClock state
    content = content.replace(/  \/\/ UI clock state - updates every second for smooth display\n  const \[uiClock, setUiClock\] = useState\(0\);\n\n/g, '');
    
    // Remove useUnifiedTimer hook
    content = content.replace(/  \/\/ SECURITY FIX: Use unified timer - single source of truth\n  const unifiedTimer = useUnifiedTimer\(studentId, SOCKET_URL, {[\s\S]*?}\);\n\n/g, '');
    
    // Remove timer state extraction
    content = content.replace(/  \/\/ Extract timer state for UI \(read-only\)\n  const {\n    timerState,\n    startTimer,\n    stopTimer,\n    pauseTimer,\n    resumeTimer,\n    isSecure,\n    securityStatus\n  } = unifiedTimer;\n\n/g, '');
    
    // 4. Remove timer-related useEffect hooks
    console.log('4️⃣ Removing timer-related useEffect hooks...');
    
    // Remove displayTime sync useEffect
    content = content.replace(/  \/\/ Sync displayTime with serverTimerData when server broadcasts arrive\n  useEffect\(\(\) => {\n    setDisplayTime\(serverTimerData\.attendedSeconds\);\n  }, \[serverTimerData\.attendedSeconds\]\);\n\n/g, '');
    
    // Remove UI Clock useEffect
    content = content.replace(/  \/\/ UI Clock - Increment display time every second when running\n  useEffect\(\(\) => {\n    if \(!isRunning \|\| selectedRole !== 'student'\) return;\n\n    \/\/ Update display time every second for smooth timer\n    const clockInterval = setInterval\(\(\) => {\n      setDisplayTime\(prev => prev \+ 1\);\n      setUiClock\(prev => prev \+ 1\); \/\/ Force re-render\n    }, 1000\);\n\n    return \(\) => clearInterval\(clockInterval\);\n  }, \[isRunning, selectedRole\]\);\n\n/g, '');
    
    // Remove Timer Heartbeat useEffect (multi-line, complex)
    content = content.replace(/  \/\/ Timer Heartbeat - Send updates to server every 5 minutes for attendance management\n  useEffect\(\(\) => {[\s\S]*?}, \[isRunning, selectedRole, studentId, serverTimerData\.attendedSeconds\]\);\n\n/g, '');
    
    // Remove Real-time timer updates useEffect
    content = content.replace(/  \/\/ Real-time timer updates via WebSocket - Send every 10 seconds for live teacher display\n  useEffect\(\(\) => {[\s\S]*?}, \[isRunning, selectedRole, studentId, studentName, displayTime, userData, semester, branch\]\);\n\n/g, '');
    
    // 5. Remove setIsRunning calls
    console.log('5️⃣ Removing setIsRunning calls...');
    content = content.replace(/setIsRunning\(false\);/g, '// Timer removed - period-based attendance');
    content = content.replace(/setIsRunning\(true\);/g, '// Timer removed - period-based attendance');
    
    // 6. Remove timer-related comments
    console.log('6️⃣ Cleaning up timer-related comments...');
    content = content.replace(/  \/\/ Removed timeLeft state - attendance is tracked by server\n/g, '');
    content = content.replace(/  \/\/ Removed 5-minute backup - server handles all attendance tracking via timer broadcasts\n/g, '');
    
    // 7. Remove CircularTimer component rendering (we'll need to check the render section)
    console.log('7️⃣ Note: CircularTimer component rendering needs manual review');
    
    // Calculate changes
    const newLength = content.length;
    const removed = originalLength - newLength;
    
    console.log('\n📊 Cleanup Summary:');
    console.log('   Original size:', originalLength, 'bytes');
    console.log('   New size:', newLength, 'bytes');
    console.log('   Removed:', removed, 'bytes');
    console.log('   Reduction:', ((removed / originalLength) * 100).toFixed(2) + '%');
    
    // Write cleaned content
    fs.writeFileSync('App.js', content, 'utf8');
    
    console.log('\n✅ App.js cleanup complete!');
    console.log('\n⚠️  Manual steps required:');
    console.log('   1. Review App.js for any remaining timer references');
    console.log('   2. Remove CircularTimer component from render section');
    console.log('   3. Remove timer UI buttons (Start/Stop/Pause)');
    console.log('   4. Test the app to ensure it works');
    console.log('\n' + '='.repeat(60));
    
} catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error(error.stack);
    process.exit(1);
}
