import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Vibration,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { PlayIcon, PauseIcon } from './Icons';

// Constants for circle dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_SIZE = Math.min(SCREEN_WIDTH - 80, 280); // 280px max - Total size
const CENTER = TIMER_SIZE / 2; // Center point (140px at max)
const OUTER_R = 125; // 250px diameter - Ring outer radius
const RING_WIDTH = 24; // 24px - Ring thickness
const INNER_R = 101; // 202px diameter - Ring inner radius
const WHITE_CIRCLE_R = 87.5; // 175px diameter - White circle
const PROGRESS_R = 80; // 160px diameter - Progress ring (inside white circle)

// Default segments
const DEFAULT_SEGMENTS = [
  { id: 1, label: 'ENGLISH', color: '#22c55e', start: 0, end: 45 },
  { id: 2, label: 'MATH', color: '#991b1b', start: 45, end: 90 },
  { id: 3, label: 'SCIENCE', color: '#f97316', start: 90, end: 135 },
  { id: 4, label: 'HISTORY', color: '#1f2937', start: 135, end: 180 },
  { id: 5, label: 'ART', color: '#ec4899', start: 180, end: 225 },
  { id: 6, label: 'MUSIC', color: '#a855f7', start: 225, end: 270 },
  { id: 7, label: 'GYM', color: '#84cc16', start: 270, end: 315 },
  { id: 8, label: 'READING', color: '#ffc0cb', start: 315, end: 360 },
];

export default function CircularTimer({
  theme = {},
  initialTime = 0,
  totalLectureTime = 0,
  remainingTime = 0,
  isRunning = false,
  onToggleTimer = () => { },
  onReset = () => { },
  onLongPressCenter = () => { },
  formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },
  timetable = null,
  currentDay = null,
  lectureInfo = null,
  serverUrl = null,
  studentId = null,
  onTimerPaused = () => { },
  onTimerResumed = () => { },
}) {
  const safeTheme = {
    primary: theme.primary || '#d97706',
    background: theme.background || '#fef3e2',
    cardBackground: theme.cardBackground || '#ffffff',
    text: theme.text || '#2c1810',
    textSecondary: theme.textSecondary || '#8b6f47',
    border: theme.border || '#f3d5a0',
  };

  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [activeSegment, setActiveSegment] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [circleScale, setCircleScale] = useState(new Animated.Value(0));
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // WiFi-based attendance tracking (simplified)
  const [wifiStatus, setWifiStatus] = useState('disconnected');
  const [canStartTimer, setCanStartTimer] = useState(true);

  // Simplified animations to prevent crashes
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const longPressAnim = useRef(new Animated.Value(0)).current;

  // Generate segments from timetable
  useEffect(() => {
    console.log('≡ƒöä CircularTimer useEffect triggered');
    console.log('  - Current Day:', currentDay);
    console.log('  - Current Day type:', typeof currentDay);
    console.log('  - Timetable exists:', !!timetable);
    console.log('  - Timetable.schedule exists:', !!timetable?.schedule);
    
    // If timetable hasn't loaded yet, don't set DEFAULT_SEGMENTS
    // Keep waiting for the timetable to load
    if (!timetable || !timetable.schedule) {
      console.log('ΓÅ│ Waiting for timetable to load... (not setting defaults)');
      return;
    }
    
    if (timetable.schedule) {
      console.log('  - Schedule keys:', Object.keys(timetable.schedule));
      console.log('  - Looking for key:', currentDay);
      console.log('  - Key exists:', currentDay in timetable.schedule);
    }
    console.log('  - Schedule for day:', timetable.schedule[currentDay]);

    if (timetable.schedule[currentDay]) {
      const schedule = timetable.schedule[currentDay];
      console.log('Γ£à CircularTimer - Found schedule with', schedule.length, 'periods');
      if (Array.isArray(schedule) && schedule.length > 0) {
        const angleStep = 360 / schedule.length;

        // Enhanced shortform mapping for better circle display
        const getShortForm = (subject) => {
          const shortForms = {
            // Programming subjects
            'PROGRAMMING IN C': 'C PROG',
            'PROGRAMMING PRACTICE': 'C PRAC',
            'PROGRAMMING LAB': 'C LAB',
            'C PROGRAMMING': 'C PROG',
            'C++ PROGRAMMING': 'C++',
            'JAVA PROGRAMMING': 'JAVA',
            'PYTHON PROGRAMMING': 'PYTHON',
            
            // Mathematics subjects
            'MATHEMATICS-I': 'MATH-I',
            'MATHEMATICS-II': 'MATH-II',
            'MATHEMATICS PRACTICE': 'MATH',
            'MATHEMATICS TUTORIAL': 'MATH TUT',
            'APPLIED MATHEMATICS': 'APP MATH',
            'DISCRETE MATHEMATICS': 'DISCRETE',
            
            // Science subjects
            'PHYSICS WORKSHOP': 'PHYSICS',
            'PHYSICS LAB': 'PHY LAB',
            'CHEMISTRY LAB': 'CHEM LAB',
            'CHEMISTRY WORKSHOP': 'CHEMISTRY',
            'APPLIED PHYSICS': 'APP PHY',
            'APPLIED CHEMISTRY': 'APP CHEM',
            
            // Engineering subjects
            'ENGINEERING DRAWING': 'ENG DRW',
            'ENGINEERING MECHANICS': 'ENG MECH',
            'ELECTRICAL ENGINEERING': 'ELECTRICAL',
            'MECHANICAL ENGINEERING': 'MECHANICAL',
            'CIVIL ENGINEERING': 'CIVIL',
            
            // Computer Science subjects
            'DATA STRUCTURES': 'DS',
            'DATABASE MANAGEMENT': 'DBMS',
            'DATABASE MANAGEMENT SYSTEM': 'DBMS',
            'MACHINE LEARNING': 'ML',
            'ARTIFICIAL INTELLIGENCE': 'AI',
            'DIGITAL ELECTRONICS': 'DIGITAL',
            'SIGNALS & SYSTEMS': 'SIGNALS',
            'COMPUTER NETWORKS': 'NETWORKS',
            'OPERATING SYSTEMS': 'OS',
            'SOFTWARE ENGINEERING': 'SE',
            'WEB DEVELOPMENT': 'WEB DEV',
            'MOBILE DEVELOPMENT': 'MOBILE',
            
            // Language subjects
            'ENGLISH PROJECT': 'ENGLISH',
            'ENGLISH READING': 'ENGLISH',
            'ENGLISH COMMUNICATION': 'ENGLISH',
            'TECHNICAL WRITING': 'TECH WRT',
            
            // Other subjects
            'PROJECT WORK': 'PROJECT',
            'LUNCH BREAK': 'LUNCH',
            'TEA BREAK': 'BREAK',
            'WORKSHOP PRACTICE': 'WORKSHOP',
            'INDUSTRIAL TRAINING': 'TRAINING',
            'SEMINAR': 'SEMINAR',
            'PRESENTATION': 'PRESENT',
          };
          
          // Return mapped short form or truncate long names
          const mapped = shortForms[subject];
          if (mapped) return mapped;
          
          // Auto-truncate long subjects to fit in circle
          if (subject.length > 8) {
            // Try to create meaningful abbreviation
            const words = subject.split(' ');
            if (words.length > 1) {
              return words.map(word => word.charAt(0)).join('').substring(0, 6);
            }
            return subject.substring(0, 6);
          }
          
          return subject;
        };

        const newSegments = schedule.map((slot, i) => {
          const subject = (slot.subject || '').toUpperCase().trim();
          
          // Enhanced color mapping with partial matching
          const getColor = (subj) => {
            // Direct matches
            const colorMap = {
              'ENGLISH': '#22c55e',
              'MATH': '#991b1b',
              'MATHEMATICS': '#991b1b',
              'MATHEMATICS-I': '#991b1b',
              'MATHEMATICS-II': '#991b1b',
              'SCIENCE': '#f97316',
              'PHYSICS': '#3b82f6',
              'CHEMISTRY': '#8b5cf6',
              'BIOLOGY': '#10b981',
              'HISTORY': '#1f2937',
              'GEOGRAPHY': '#0891b2',
              'ART': '#ec4899',
              'MUSIC': '#a855f7',
              'GYM': '#84cc16',
              'PE': '#84cc16',
              'COMPUTER': '#6366f1',
              'CS': '#6366f1',
              'BREAK': '#fbbf24',
              'LUNCH': '#f59e0b',
              'PROGRAMMING': '#6366f1',
              'PROGRAMMING IN C': '#6366f1',
              'PROGRAMMING PRACTICE': '#6366f1',
              'PROGRAMMING LAB': '#6366f1',
              'MATHEMATICS PRACTICE': '#991b1b',
              'MATHEMATICS TUTORIAL': '#991b1b',
              'PHYSICS WORKSHOP': '#3b82f6',
              'PHYSICS LAB': '#3b82f6',
              'CHEMISTRY LAB': '#8b5cf6',
              'CHEMISTRY WORKSHOP': '#8b5cf6',
              'ENGINEERING DRAWING': '#f97316',
              'ENGLISH PROJECT': '#22c55e',
              'ENGLISH READING': '#22c55e',
              'PROJECT WORK': '#64748b',
              'DATA STRUCTURES': '#6366f1',
              'DATABASE': '#8b5cf6',
              'DBMS': '#8b5cf6',
              'MACHINE LEARNING': '#ec4899',
              'ML': '#ec4899',
              'ARTIFICIAL INTELLIGENCE': '#a855f7',
              'AI': '#a855f7',
              'DIGITAL': '#3b82f6',
              'SIGNALS': '#0891b2',
            };
            
            // Check direct match first
            if (colorMap[subj]) return colorMap[subj];
            
            // Check partial matches
            if (subj.includes('PROG')) return '#6366f1';
            if (subj.includes('MATH')) return '#991b1b';
            if (subj.includes('PHYS')) return '#3b82f6';
            if (subj.includes('CHEM')) return '#8b5cf6';
            if (subj.includes('ENG')) return '#22c55e';
            if (subj.includes('BREAK') || subj.includes('LUNCH')) return '#fbbf24';
            if (subj.includes('LAB')) return '#10b981';
            if (subj.includes('WORKSHOP')) return '#f97316';
            
            // Generate color based on hash for consistency
            const colors = ['#22c55e', '#991b1b', '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#a855f7', '#84cc16', '#0891b2'];
            const hash = subj.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return colors[hash % colors.length];
          };
          
          const shortLabel = getShortForm(subject);
          const color = getColor(subject);
          
          console.log(`Segment ${i}: ${subject} -> ${shortLabel} -> ${color}`);

          return {
            id: i + 1,
            label: shortLabel || 'CLASS',
            room: slot.room || '',
            time: slot.time || '',
            color: color,
            start: i * angleStep,
            end: (i + 1) * angleStep,
          };
        });
        console.log('CircularTimer - Setting new segments:', newSegments);
        setSegments(newSegments);
      } else {
        console.log('CircularTimer - Schedule is not an array or empty');
      }
    } else {
      console.log('ΓÜá∩╕Å CircularTimer - No schedule found for current day:', currentDay);
      console.log('  Available days:', timetable.schedule ? Object.keys(timetable.schedule) : 'none');
      console.log('  This might be an old timetable without Sunday support!');
      console.log('  Using DEFAULT_SEGMENTS as fallback');
      setSegments(DEFAULT_SEGMENTS);
    }
  }, [timetable, currentDay]);

  // Simplified pulse animation to prevent crashes
  useEffect(() => {
    if (isRunning) {
      // Simple pulse without complex loops
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]).start(() => {
          if (isRunning) pulse(); // Continue only if still running
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  // Current time is now managed by state - updates every second

  // Simplified segment animation to prevent crashes
  // Removed complex morphing animations that cause crashes

  // Create arc path for a segment
  const createSegmentPath = (startAngle, endAngle) => {
    const toRad = (angle) => ((angle - 90) * Math.PI) / 180;
    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);

    const x1 = CENTER + INNER_R * Math.cos(startRad);
    const y1 = CENTER + INNER_R * Math.sin(startRad);
    const x2 = CENTER + OUTER_R * Math.cos(startRad);
    const y2 = CENTER + OUTER_R * Math.sin(startRad);
    const x3 = CENTER + OUTER_R * Math.cos(endRad);
    const y3 = CENTER + OUTER_R * Math.sin(endRad);
    const x4 = CENTER + INNER_R * Math.cos(endRad);
    const y4 = CENTER + INNER_R * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M${x1},${y1} L${x2},${y2} A${OUTER_R},${OUTER_R} 0 ${largeArc},1 ${x3},${y3} L${x4},${y4} A${INNER_R},${INNER_R} 0 ${largeArc},0 ${x1},${y1} Z`;
  };

  // Get angle from touch point
  const getAngle = (x, y) => {
    const angle = (Math.atan2(y - CENTER, x - CENTER) * 180) / Math.PI + 90;
    return angle < 0 ? angle + 360 : angle;
  };

  // Find segment at angle
  const findSegment = (angle) => {
    return segments.find((s) => {
      if (s.start > s.end) return angle >= s.start || angle <= s.end;
      return angle >= s.start && angle <= s.end;
    });
  };

  // Get segment center position (in the middle of the ring thickness)
  const getSegmentCenter = (seg) => {
    const midAngle = ((seg.start + seg.end) / 2 - 90) * (Math.PI / 180);
    const ringCenterRadius = (INNER_R + OUTER_R) / 2; // Center of the ring thickness
    return {
      x: CENTER + ringCenterRadius * Math.cos(midAngle),
      y: CENTER + ringCenterRadius * Math.sin(midAngle),
    };
  };

  // Create a circular path at segment position
  const createCirclePath = (seg) => {
    const pos = getSegmentCenter(seg);
    const r = 28; // Larger circle for better visibility (56px diameter)
    return `M ${pos.x - r},${pos.y} A ${r},${r} 0 1,0 ${pos.x + r},${pos.y} A ${r},${r} 0 1,0 ${pos.x - r},${pos.y} Z`;
  };

  // Calculate clock hand angles based on class progress
  const getClassProgressAngles = () => {
    if (!timetable?.schedule?.[currentDay]) {
      // No timetable, use timer progress
      const progress = (initialTime % 60) / 60;
      return {
        elapsedAngle: progress * 360, // Time done
        remainingAngle: 180 + (progress * 180), // Opposite side
      };
    }

    // Find current class
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentTimeInSeconds = (currentHour * 3600) + (currentMinute * 60) + currentSeconds;

    const schedule = timetable.schedule[currentDay];
    let currentClass = null;

    for (const slot of schedule) {
      if (slot.time) {
        const [start, end] = slot.time.split('-').map(t => t.trim());
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startSeconds = (startH * 3600) + (startM * 60);
        const endSeconds = (endH * 3600) + (endM * 60);

        if (currentTimeInSeconds >= startSeconds && currentTimeInSeconds <= endSeconds) {
          currentClass = {
            start: startSeconds,
            end: endSeconds,
            duration: endSeconds - startSeconds,
            elapsed: currentTimeInSeconds - startSeconds,
          };
          break;
        }
      }
    }

    if (currentClass) {
      // Calculate progress through current class
      const progress = currentClass.elapsed / currentClass.duration;
      const elapsedAngle = progress * 360; // Full circle for elapsed time
      const remainingAngle = 180; // Fixed at 180┬░ (opposite direction)

      return { elapsedAngle, remainingAngle };
    }

    // No current class, show 0
    return { elapsedAngle: 0, remainingAngle: 180 };
  };

  // Create clock hand path
  const createClockHand = (angle, length, width) => {
    const rad = (angle - 90) * (Math.PI / 180);
    const x = CENTER + length * Math.cos(rad);
    const y = CENTER + length * Math.sin(rad);

    return `M ${CENTER},${CENTER} L ${x},${y}`;
  };

  // Create interpolated path for smooth morphing
  const createMorphedPath = (seg, progress) => {
    if (progress === 0) return createSegmentPath(seg.start, seg.end);
    if (progress === 1) return createCirclePath(seg);

    // Simple approach: just switch at 0.5 for now
    // For true morphing, you'd need complex path interpolation
    return progress > 0.5 ? createCirclePath(seg) : createSegmentPath(seg.start, seg.end);
  };

  // Pan responder for touch
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        setIsDragging(true);
        // Simplified scale animation
        scaleAnim.setValue(1.03);
        const angle = getAngle(e.nativeEvent.locationX, e.nativeEvent.locationY);
        const seg = findSegment(angle);
        if (seg) {
          setActiveSegment(seg.id);
          // Animate circle appearance
          Animated.spring(circleScale, {
            toValue: 1,
            tension: 200,
            friction: 10,
            useNativeDriver: false,
          }).start();
          try { Vibration.vibrate(15); } catch (err) { }
        }
      },

      onPanResponderMove: (e) => {
        const angle = getAngle(e.nativeEvent.locationX, e.nativeEvent.locationY);
        const seg = findSegment(angle);
        if (seg && seg.id !== activeSegment) {
          setActiveSegment(seg.id);
          // Animate new circle
          circleScale.setValue(0);
          Animated.spring(circleScale, {
            toValue: 1,
            tension: 200,
            friction: 10,
            useNativeDriver: false,
          }).start();
          try { Vibration.vibrate(15); } catch (err) { }
        }
      },

      onPanResponderRelease: () => {
        setIsDragging(false);
        // Simplified scale reset
        scaleAnim.setValue(1);
        // Animate circle disappearance
        Animated.timing(circleScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setActiveSegment(null);
        });
      },

      onPanResponderTerminate: () => {
        setIsDragging(false);
        // Simplified scale reset
        scaleAnim.setValue(1);
      },
    })
  ).current;

  // Progress calculation
  const progress = (initialTime % 60) / 60;
  const circumference = 2 * Math.PI * PROGRESS_R;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.timer, { transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }]}
        {...panResponder.panHandlers}
      >
        <Svg
          width={TIMER_SIZE}
          height={TIMER_SIZE}
          viewBox={`0 0 ${TIMER_SIZE} ${TIMER_SIZE}`}
          style={{ overflow: 'visible', backgroundColor: 'transparent' }}
          pointerEvents="box-none"
        >
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={safeTheme.primary} />
              <Stop offset="50%" stopColor="#a855f7" />
              <Stop offset="100%" stopColor="#3b82f6" />
            </LinearGradient>
          </Defs>

          {/* Segments with smooth morph animation */}
          {segments.map((seg) => {
            const isActive = activeSegment === seg.id;
            const centerPos = getSegmentCenter(seg);

            return (
              <G key={seg.id}>
                {/* Normal segment */}
                <Path
                  d={createSegmentPath(seg.start, seg.end)}
                  fill={seg.color}
                  stroke={safeTheme.background}
                  strokeWidth="2"
                  opacity={isActive ? 0.3 : 1}
                  fillOpacity={isActive ? 0.3 : 0.95}
                />

                {/* Active segment as animated floating circle */}
                {isActive && (
                  <G opacity={circleScale}>
                    {/* Outer border circle */}
                    <Circle
                      cx={centerPos.x}
                      cy={centerPos.y}
                      r="28"
                      fill="none"
                      stroke={safeTheme.cardBackground}
                      strokeWidth="3"
                      opacity="0.9"
                    />
                    
                    {/* Main colored circle */}
                    <Circle
                      cx={centerPos.x}
                      cy={centerPos.y}
                      r="25"
                      fill={seg.color}
                      opacity="0.95"
                    />
                    
                    {/* Subject name text */}
                    <SvgText
                      x={centerPos.x}
                      y={centerPos.y - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {seg.label}
                    </SvgText>
                    
                    {/* Room number text */}
                    {seg.room && (
                      <SvgText
                        x={centerPos.x}
                        y={centerPos.y + 7}
                        textAnchor="middle"
                        fontSize="7"
                        fontWeight="500"
                        fill="#ffffff"
                        opacity="0.9"
                      >
                        {seg.room}
                      </SvgText>
                    )}
                  </G>
                )}
              </G>
            );
          })}

          {/* Center white circle */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={WHITE_CIRCLE_R}
            fill={safeTheme.cardBackground}
            stroke={safeTheme.border}
            strokeWidth="2"
          />

          {/* Progress ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={PROGRESS_R}
            fill="none"
            stroke="url(#grad)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />

          {/* No clock hands - clean design */}
        </Svg>

        {/* Center controls - Fixed z-index layering */}
        <TouchableOpacity
          style={[styles.center, { zIndex: 1000 }]} // Ensure center is above arcs
          onPressIn={() => {
            setIsLongPressing(true);
            // Simplified long press animation
            longPressAnim.setValue(1);
          }}
          onPressOut={() => {
            setIsLongPressing(false);
            // Simplified long press reset
            longPressAnim.setValue(0);
          }}
          onLongPress={() => {
            console.log('🔒 Long press detected on timer center - triggering face verification');
            Vibration.vibrate(50);
            setIsLongPressing(false);
            onLongPressCenter();
          }}
          delayLongPress={800}
          activeOpacity={1}
        >


          {/* Time Display in HH:MM:SS format */}
          <Text style={{ color: safeTheme.text, fontSize: 20, fontWeight: 'bold', marginTop: 8 }}>
            {(() => {
              const hours = Math.floor(initialTime / 3600);
              const minutes = Math.floor((initialTime % 3600) / 60);
              const seconds = initialTime % 60;
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            })()}
          </Text>
          <Text style={[styles.timeLabel, { color: safeTheme.textSecondary, fontSize: 10, marginTop: 3 }]}>
            LECTURE TIME
          </Text>

          {/* Show start button when not running - Fixed z-index */}
          {!isRunning && (
            <View style={{ alignItems: 'center', marginTop: 15, zIndex: 1001 }}>
              <TouchableOpacity
                style={[
                  styles.playBtn, 
                  { 
                    backgroundColor: safeTheme.primary,
                    zIndex: 1002, // Ensure play button is above everything
                    elevation: 10, // Android elevation

                  }
                ]}
                onPress={onToggleTimer}
                activeOpacity={0.8}
              >
                <PlayIcon size={20} color={safeTheme.background} />
              </TouchableOpacity>
            </View>
          )}

          {/* Show running indicator when active */}
          {isRunning && (
            <View style={[styles.runningBadge, { backgroundColor: '#22c55e', marginTop: 15 }]}>
              <Text style={styles.runningText}>🔴 TRACKING</Text>
            </View>
          )}



          {/* Simplified Long Press Indicator */}
          {isLongPressing && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: safeTheme.primary + '20',
                borderRadius: 100,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderWidth: 4,
                  borderColor: safeTheme.primary,
                  borderTopColor: 'transparent',
                }}
              />
              <Text
                style={{
                  position: 'absolute',
                  color: safeTheme.primary,
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginTop: 80,
                }}
              >
                🔒 Hold to Verify
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>



      {/* Hint */}
      <View style={styles.hint}>
        <Text style={[styles.hintText, { color: safeTheme.textSecondary }]}>
          {isDragging ? '🎯 Drag around the circle' : '🎯 Tap or drag segments'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  timer: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure center controls are above SVG
    elevation: 10, // Android elevation
  },
  time: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  playBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 12, // Higher elevation to be above everything
    zIndex: 20, // Ensure it's on top
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
  runningBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  runningText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 20,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
