import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import FilterButtons from './FilterButtons';

const StudentList = ({ theme, students = [], onStudentPress, activeRandomRing = null, onTeacherAction }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter students based on selected filter
  const filteredStudents = students.filter((student) => {
    if (selectedFilter === 'all') return true;
    
    // Active: Timer is currently running
    if (selectedFilter === 'active') {
      return student.isRunning === true;
    }
    
    // Present: Timer has crossed the attendance threshold (set in admin panel)
    // This is determined by the server based on time attended vs total class time
    if (selectedFilter === 'present') {
      return student.status === 'present';
    }
    
    // Absent: Timer not started OR inactive for 30+ minutes
    if (selectedFilter === 'absent') {
      // Check if timer is not running
      if (!student.isRunning) {
        return true;
      }
      
      // Check if inactive for 30+ minutes (1800 seconds)
      const lastUpdate = student.lastUpdated ? new Date(student.lastUpdated) : null;
      if (lastUpdate) {
        const inactiveSeconds = (Date.now() - lastUpdate.getTime()) / 1000;
        if (inactiveSeconds >= 1800) { // 30 minutes = 1800 seconds
          return true;
        }
      }
      
      return false;
    }
    
    // Fallback to status-based filtering
    return student.status === selectedFilter;
  });

  // Calculate counts for each filter
  const filterCounts = {
    all: students.length,
    
    // Active: Students with timer currently running
    active: students.filter((s) => s.isRunning === true).length,
    
    // Present: Students who have crossed the attendance threshold
    present: students.filter((s) => s.status === 'present').length,
    
    // Absent: Students with timer not running OR inactive for 30+ minutes
    absent: students.filter((s) => {
      // Timer not running
      if (!s.isRunning) return true;
      
      // Check if inactive for 30+ minutes
      const lastUpdate = s.lastUpdated ? new Date(s.lastUpdated) : null;
      if (lastUpdate) {
        const inactiveSeconds = (Date.now() - lastUpdate.getTime()) / 1000;
        if (inactiveSeconds >= 1800) return true; // 30 minutes
      }
      
      return false;
    }).length,
    
    left: students.filter((s) => s.status === 'left').length,
  };

  const presentCount = students.filter(
    (s) => s.isRunning === true || s.status === 'present'
  ).length;

  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    if (onStudentPress) {
      onStudentPress(student);
    }
  };

  const renderStudentItem = ({ item: student }) => {
    // Check if this student is in active random ring
    // Convert student._id to string for comparison
    const studentIdStr = student._id ? student._id.toString() : null;
    const randomRingStudent = activeRandomRing?.selectedStudents?.find(s => {
      // Try multiple matching strategies
      if (s.studentId === studentIdStr) return true;
      if (s.studentId === student._id) return true;
      if (s.studentId === student.enrollmentNo) return true;
      if (s.enrollmentNo === student.enrollmentNo) return true;
      if (s.enrollmentNo === studentIdStr) return true;
      return false;
    });
    
    return (
      <StudentItem
        student={student}
        theme={theme}
        onPress={() => handleStudentPress(student)}
        randomRingStudent={randomRingStudent}
        onTeacherAction={onTeacherAction || (() => console.log('onTeacherAction not provided'))}
        randomRingId={activeRandomRing?._id}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Class Attendance
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {presentCount} / {students.length} Present
        </Text>
      </View>

      {/* Filter Buttons */}
      <FilterButtons
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        counts={filterCounts}
        theme={theme}
      />

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {selectedFilter === 'all' 
              ? 'No students enrolled in this class yet.'
              : `No students with status: ${selectedFilter}`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item._id || item.id || item.enrollmentNo}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const StudentItem = ({ student, theme, onPress, randomRingStudent, onTeacherAction, randomRingId }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [currentTimerValue, setCurrentTimerValue] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Single useEffect to handle timer display - synced with server broadcasts
  useEffect(() => {
    // Handle absent status
    if (student.status === 'absent') {
      setElapsedTime('00:00');
      setCurrentTimerValue(0);
      return;
    }

    // Use timerValue from server broadcasts (single source of truth)
    if (student.timerValue !== undefined && student.timerValue !== null) {
      // Update local state with server value
      setCurrentTimerValue(student.timerValue);
      
      // Update display
      const minutes = Math.floor(student.timerValue / 60);
      const seconds = student.timerValue % 60;
      setElapsedTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    } else {
      // Fallback: calculate from joinTime (only if no timerValue from server)
      const updateTimer = () => {
        const now = new Date();
        const joinTime = student.joinTime ? new Date(student.joinTime) : new Date();
        const diff = Math.floor((now.getTime() - joinTime.getTime()) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [student.timerValue, student.status, student.joinTime]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
      case 'attending':
        return { bg: '#d1fae5', text: '#059669' };
      case 'present':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'absent':
        return { bg: '#fee2e2', text: '#dc2626' };
      case 'left':
        return { bg: '#fed7aa', text: '#ea580c' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
      case 'attending':
        return 'Attending';
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'left':
        return 'Left Early';
      default:
        return 'Unknown';
    }
  };

  const statusStyle = getStatusStyle(student.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.studentCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
    >
      <View style={styles.studentContent}>
        {/* Profile Image */}
        <Image
          source={{ uri: student.profileImage || student.profilePhoto || 'https://via.placeholder.com/56' }}
          style={styles.profileImage}
        />

        {/* Name and Status */}
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: theme.text }]} numberOfLines={1}>
            {student.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusLabel(student.status)}
            </Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: theme.text }]}>
            {elapsedTime}
          </Text>
        </View>
      </View>
      
      {/* Accept/Reject Buttons for Random Ring */}
      {randomRingStudent && randomRingStudent.teacherAction === 'pending' && !randomRingStudent.verified && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.acceptButton, { opacity: actionLoading ? 0.5 : 1 }]}
            onPress={async () => {
              if (actionLoading) return;
              if (!onTeacherAction) {
                console.error('❌ onTeacherAction not provided');
                alert('Error: Teacher action handler not available');
                return;
              }
              if (!randomRingId) {
                console.error('❌ randomRingId not provided');
                alert('Error: No active random ring');
                return;
              }
              
              // Use the same ID that was used to create the random ring
              // Priority: _id.toString() > enrollmentNo (matching server logic)
              const studentIdToUse = (student._id ? student._id.toString() : null) || student.enrollmentNo;
              console.log('👆 Accept button pressed');
              console.log('   Student:', student.name);
              console.log('   Student _id:', student._id);
              console.log('   Student enrollmentNo:', student.enrollmentNo);
              console.log('   Using ID:', studentIdToUse);
              console.log('   Random Ring ID:', randomRingId);
              console.log('   Random Ring Student ID:', randomRingStudent?.studentId);
              console.log('   Random Ring Student enrollmentNo:', randomRingStudent?.enrollmentNo);
              
              setActionLoading(true);
              try {
                await onTeacherAction(randomRingId, studentIdToUse, 'accepted');
              } catch (error) {
                console.error('❌ Error accepting student:', error);
                alert('Error accepting student. Please check your connection.');
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
          >
            <Text style={styles.acceptButtonText}>✓ Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.rejectButton, { opacity: actionLoading ? 0.5 : 1 }]}
            onPress={async () => {
              if (actionLoading) return;
              if (!onTeacherAction) {
                console.error('❌ onTeacherAction not provided');
                alert('Error: Teacher action handler not available');
                return;
              }
              if (!randomRingId) {
                console.error('❌ randomRingId not provided');
                alert('Error: No active random ring');
                return;
              }
              
              // Use the same ID that was used to create the random ring
              // Priority: _id.toString() > enrollmentNo (matching server logic)
              const studentIdToUse = (student._id ? student._id.toString() : null) || student.enrollmentNo;
              console.log('👆 Reject button pressed');
              console.log('   Student:', student.name);
              console.log('   Student _id:', student._id);
              console.log('   Student enrollmentNo:', student.enrollmentNo);
              console.log('   Using ID:', studentIdToUse);
              console.log('   Random Ring ID:', randomRingId);
              console.log('   Random Ring Student ID:', randomRingStudent?.studentId);
              console.log('   Random Ring Student enrollmentNo:', randomRingStudent?.enrollmentNo);
              
              setActionLoading(true);
              try {
                await onTeacherAction(randomRingId, studentIdToUse, 'rejected');
              } catch (error) {
                console.error('❌ Error rejecting student:', error);
                alert('Error rejecting student. Please check your connection.');
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
          >
            <Text style={styles.rejectButtonText}>✕ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Show status after teacher action */}
      {randomRingStudent && randomRingStudent.teacherAction !== 'pending' && (
        <View style={styles.actionStatus}>
          {randomRingStudent.teacherAction === 'accepted' && (
            <Text style={[styles.actionStatusText, { color: '#059669' }]}>
              ✓ Accepted by teacher
            </Text>
          )}
          {randomRingStudent.teacherAction === 'rejected' && !randomRingStudent.faceVerifiedAfterRejection && (
            <Text style={[styles.actionStatusText, { color: '#dc2626' }]}>
              ✕ Rejected - Waiting for face verification
            </Text>
          )}
          {randomRingStudent.faceVerifiedAfterRejection && (
            <Text style={[styles.actionStatusText, { color: '#059669' }]}>
              ✓ Face verified after rejection
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    maxWidth: 768, // 3xl
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  studentCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16, // space-y-4 = 16px
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  studentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    borderRadius: 8,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionStatus: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionStatusText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default StudentList;
