'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Course, AttendanceSession } from '@/types';
import { Loader, QrCode, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (user?.role !== 'student') {
      setError('Only students can access this page');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch student's enrolled courses
        const studentCourses = await FirestoreService.getStudentCourses(user.uid);
        setCourses(studentCourses);
        setError('');
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchData();
    }
  }, [user, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">Please log in first</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-4 pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Attendance</h1>
          <p className="text-sm md:text-base text-gray-600">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* Quick Action - Mobile Optimized */}
        <Link
          href="/attendance/scan"
          className="block mb-6 md:mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition p-4 md:p-6 text-white active:scale-95"
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <QrCode className="w-6 md:w-8 h-6 md:h-8 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-bold">Scan QR Code</h2>
              <p className="text-indigo-100 text-xs md:text-sm">Mark attendance for a session</p>
            </div>
          </div>
        </Link>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6 flex items-start space-x-2 md:space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Courses Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Your Courses</h2>

          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm md:text-base">
                You are not enrolled in any courses yet
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 md:p-6 active:scale-95"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2 mb-1 flex-wrap gap-2">
                        <h3 className="text-base md:text-lg font-bold text-gray-800">
                          {course.title}
                        </h3>
                        <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {course.code}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mb-2">
                        Lecturer: <span className="font-semibold">{course.lecturerName}</span>
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 line-clamp-2 mb-2">
                        {course.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          {course.students.length} student{course.students.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/attendance/scan"
                      className="ml-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap text-xs md:text-sm font-medium flex items-center space-x-1 flex-shrink-0"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 md:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-xs md:text-sm">
          <p className="text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Tap "Scan QR Code" to mark your attendance. You can only mark attendance while the session is active.
          </p>
        </div>
      </div>
    </div>
  );
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* Quick Action */}
        <Link
          href="/attendance/scan"
          className="block mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition p-6 text-white"
        >
          <div className="flex items-center space-x-4">
            <QrCode className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Scan QR Code</h2>
              <p className="text-indigo-100">Mark attendance for a session</p>
            </div>
          </div>
        </Link>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Courses</h2>

          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                You are not enrolled in any courses yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {course.title}
                        </h3>
                        <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {course.code}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Lecturer:{' '}
                        <span className="font-semibold">{course.lecturerName}</span>
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          {course.students.length} student
                          {course.students.length !== 1 ? 's' : ''} enrolled
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/attendance/scan"
                      className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap text-sm font-medium flex items-center space-x-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan QR</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Tap "Scan QR Code"
            to mark your attendance. You can only mark attendance while the
            session is active.
          </p>
        </div>
      </div>
    </div>
  );
}
