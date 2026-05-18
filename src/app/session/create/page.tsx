'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Course, AttendanceSession } from '@/types';
import { AlertCircle, Copy, CheckCircle, Clock, Play, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PageState = 'loading' | 'select-course' | 'session-active' | 'session-closed' | 'error';

export default function CreateSessionPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  // State
  const [pageState, setPageState] = useState<PageState>('loading');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch lecturer's courses
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (user?.role !== 'staff') {
      setError('Only lecturers can access this page');
      setPageState('error');
      return;
    }

    const fetchCourses = async () => {
      try {
        const lecturerCourses = await FirestoreService.getCoursesByLecturer(
          user.uid
        );
        setCourses(lecturerCourses);
        setPageState('select-course');
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        setPageState('error');
      }
    };

    if (user?.uid) {
      fetchCourses();
    }
  }, [user, status, router]);

  // Countdown timer effect
  useEffect(() => {
    if (!session || pageState !== 'session-active') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSessionExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, pageState]);

  // Calculate time remaining on mount
  useEffect(() => {
    if (session && pageState === 'session-active') {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
      setTimeRemaining(diffSecs);
    }
  }, [session, pageState]);

  // Create attendance session
  const handleCreateSession = async () => {
    if (!selectedCourse) return;

    try {
      setPageState('loading');
      // Create session with 5-minute expiry
      const newSession = await FirestoreService.createAttendanceSession(
        selectedCourse.id,
        selectedCourse.title,
        user!.uid,
        5 // 5 minutes
      );

      setSession(newSession);
      setPageState('session-active');
      setError('');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setPageState('select-course');
    }
  };

  // Handle session expired
  const handleSessionExpired = async () => {
    if (!session) return;

    try {
      await FirestoreService.closeAttendanceSession(session.id);
      setPageState('session-closed');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  // Manual close session
  const handleCloseSession = async () => {
    if (!session) return;

    try {
      await FirestoreService.closeAttendanceSession(session.id);
      setPageState('session-closed');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  // Copy session ID
  const handleCopySessionId = () => {
    if (session) {
      navigator.clipboard.writeText(session.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset to create new session
  const handleCreateNew = () => {
    setSession(null);
    setSelectedCourse(null);
    setTimeRemaining(0);
    setError('');
    setPageState('select-course');
  };

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== RENDER: Loading State =====
  if (status === 'loading' || pageState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-100">Loading...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER: Error State =====
  if (pageState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-sm text-center border border-amber-400/20">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-amber-100 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-amber-400 transition font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ===== RENDER: Select Course State =====
  if (pageState === 'select-course') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-400 mb-2">
              Create Attendance Session
            </h1>
            <p className="text-amber-100">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>
          </div>

          {/* Select Course */}
          <div className="bg-slate-800 border-2 border-amber-400/30 rounded-xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-amber-400 mb-6">Select a Course</h2>

            {courses.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-600/50 mx-auto mb-3" />
                <p className="text-amber-100/70">No courses found</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedCourse?.id === course.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-slate-600 bg-slate-700/50 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-baseline space-x-2 mb-1">
                      <h3 className="font-bold text-amber-100">{course.title}</h3>
                      <span className="text-xs font-mono text-amber-400">
                        {course.code}
                      </span>
                    </div>
                    <p className="text-sm text-amber-100/70">
                      {course.students.length} students enrolled
                    </p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCreateSession}
              disabled={!selectedCourse}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 text-slate-900 disabled:text-slate-400 py-3 rounded-lg font-bold transition flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Create Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: Session Active State =====
  if (pageState === 'session-active' && session) {
    const isLowTime = timeRemaining < 60; // Less than 1 minute

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-400 mb-2">Session Active</h1>
            <p className="text-amber-100">{selectedCourse?.title}</p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-slate-800 border-2 border-amber-400/30 rounded-xl p-8 shadow-2xl">
              <h2 className="text-lg font-bold text-amber-400 mb-6 text-center">
                Scan to Mark Attendance
              </h2>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg flex justify-center mb-6">
                <QRCode
                  value={session.id}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Session ID */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-xs text-amber-100/70 mb-2">Session ID</p>
                <div className="flex items-center justify-between bg-slate-900 rounded p-3">
                  <code className="text-sm font-mono text-amber-300 break-all">
                    {session.id}
                  </code>
                  <button
                    onClick={handleCopySessionId}
                    className={`ml-2 p-2 rounded transition ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    }`}
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Timer Card */}
            <div
              className={`rounded-xl p-8 shadow-2xl border-2 ${
                isLowTime
                  ? 'bg-red-900/20 border-red-500'
                  : 'bg-slate-800 border-amber-400/30'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Time Remaining</span>
                </h2>
              </div>

              <div className="text-center mb-6">
                <div
                  className={`text-6xl font-bold font-mono tracking-wider mb-2 ${
                    isLowTime ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-amber-100/70">
                  Session expires at{' '}
                  <span className="font-semibold">
                    {new Date(session.expiresAt).toLocaleTimeString()}
                  </span>
                </p>
              </div>

              {/* Timer Warning */}
              {isLowTime && (
                <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-200 text-sm font-semibold">
                    ⚠ Session expiring soon!
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="text-sm text-amber-100/70">
                <p>
                  Students have until the timer expires to mark their attendance.
                </p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-slate-800 border-2 border-amber-400/30 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-amber-400 mb-3">
                Students Marked
              </h3>
              <p className="text-amber-100/70 text-sm">
                Real-time attendance tracking available during the session.
              </p>
            </div>

            {/* Close Session Button */}
            <button
              onClick={handleCloseSession}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center space-x-2"
            >
              <Square className="w-5 h-5" />
              <span>Close Session Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: Session Closed State =====
  if (pageState === 'session-closed' && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-slate-800 border-2 border-amber-400/30 rounded-xl p-8 shadow-2xl text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-400 mb-2">
              Session Closed
            </h2>
            <p className="text-amber-100/70 mb-4">
              Attendance marking has been closed. Students can no longer mark attendance.
            </p>

            {session && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-amber-100/70 mb-1">Session ID</p>
                <p className="font-mono text-sm text-amber-300 break-all">{session.id}</p>
              </div>
            )}

            <button
              onClick={handleCreateNew}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-lg font-bold transition"
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
