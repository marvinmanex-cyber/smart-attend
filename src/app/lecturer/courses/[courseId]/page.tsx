'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Course } from '@/types';
import { Loader, Users, QrCode, ArrowLeft, UserPlus, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Enrollment state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [matricNumber, setMatricNumber] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const foundCourse = await FirestoreService.getCourseById(courseId);
      if (!foundCourse) {
        setError('Course not found');
      } else {
        setCourse(foundCourse);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && user?.uid) {
      fetchCourse();
    }
  }, [user, status, router, fetchCourse]);

  const handleEnrollStudent = async () => {
    if (!matricNumber.trim()) return;
    setEnrolling(true);
    setEnrollError('');
    setEnrollSuccess('');

    try {
      const student = await FirestoreService.getUserByMatricNumber(matricNumber.trim());

      if (!student) {
        setEnrollError('No student found with that matric number. Make sure they have registered first.');
        setEnrolling(false);
        return;
      }

      if (student.role !== 'student') {
        setEnrollError('This user is not registered as a student.');
        setEnrolling(false);
        return;
      }

      if (course?.students.includes(student.uid)) {
        setEnrollError('This student is already enrolled in this course.');
        setEnrolling(false);
        return;
      }

      await FirestoreService.enrollStudentInCourse(courseId, student.uid);
      setEnrollSuccess(`${student.name} has been enrolled successfully!`);
      setMatricNumber('');
      await fetchCourse();
    } catch (err) {
      const error = err as Error;
      setEnrollError(error.message || 'Failed to enroll student.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader className="w-12 h-12 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Course not found'}</p>
          <Link href="/lecturer/courses" className="text-amber-400 hover:text-amber-300">
            Go back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/lecturer/courses"
          className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">{course.title}</h1>
          <p className="text-amber-100">{course.code}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/session/create"
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-4 rounded-lg font-bold transition flex items-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Create Attendance Session</span>
          </Link>

          <Link
            href="/lecturer/reports"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-bold transition flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>View Reports</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-slate-800 border-2 border-amber-400/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-amber-400 mb-3">Description</h2>
            <p className="text-amber-100/80">{course.description}</p>
          </div>

          <div className="bg-slate-800 border-2 border-amber-400/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-amber-400 mb-4">Course Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-amber-100/70 text-sm">Enrolled Students</p>
                <p className="text-2xl font-bold text-amber-400">{course.students.length}</p>
              </div>
              <div className="pt-3 border-t border-amber-400/20">
                <p className="text-amber-100/70 text-sm">Created</p>
                <p className="text-sm text-amber-100/80">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-slate-800 border-2 border-amber-400/30 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-amber-400/20 flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-400">
              Enrolled Students ({course.students.length})
            </h2>
            <button
              onClick={() => {
                setShowEnrollModal(true);
                setEnrollError('');
                setEnrollSuccess('');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold transition flex items-center space-x-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>

          {course.students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
              <p className="text-amber-100/50 mb-4">No students enrolled yet</p>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold transition text-sm"
              >
                Enroll First Student
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50 border-b border-amber-400/20">
                  <tr>
                    <th className="text-left px-6 py-3 text-amber-400 font-semibold">#</th>
                    <th className="text-left px-6 py-3 text-amber-400 font-semibold">Student UID</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map((studentId, idx) => (
                    <tr key={studentId} className="border-b border-amber-400/10 hover:bg-amber-400/5 transition">
                      <td className="px-6 py-3 text-amber-100">{idx + 1}</td>
                      <td className="px-6 py-3 text-amber-100/70 font-mono text-xs">{studentId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-amber-400/30 rounded-xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-amber-400">Enroll a Student</h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-amber-100/50 hover:text-amber-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-amber-100/70 text-sm mb-6">
              Enter the student's matric number. They must have already registered on SmartAttend.
            </p>

            {enrollError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{enrollError}</p>
              </div>
            )}

            {enrollSuccess && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm">{enrollSuccess}</p>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter matric number e.g. U/2021/001"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-amber-400/30 text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-400 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleEnrollStudent()}
            />

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="flex-1 py-3 rounded-lg border border-amber-400/30 text-amber-100/70 hover:text-amber-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleEnrollStudent}
                disabled={enrolling || !matricNumber.trim()}
                className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 text-slate-900 disabled:text-slate-400 font-bold transition"
              >
                {enrolling ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}