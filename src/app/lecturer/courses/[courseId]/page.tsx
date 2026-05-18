'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Course, UserModel } from '@/types';
import { Loader, Users, QrCode, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        // In a real app, you'd fetch the course by ID
        // For now, we'll fetch all courses and find the matching one
        if (!user?.uid) return;

        const courses = await FirestoreService.getCoursesByLecturer(user.uid);
        const foundCourse = courses.find((c) => c.id === courseId);

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
    };

    if (user?.uid) {
      fetchCourse();
    }
  }, [user, status, router, courseId]);

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
        {/* Header */}
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

        {/* Quick Actions */}
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

        {/* Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Description */}
          <div className="md:col-span-2 bg-slate-800 border-2 border-amber-400/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-amber-400 mb-3">Description</h2>
            <p className="text-amber-100/80">{course.description}</p>
          </div>

          {/* Stats */}
          <div className="bg-slate-800 border-2 border-amber-400/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-amber-400 mb-4">Course Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-amber-100/70 text-sm">Enrolled Students</p>
                <p className="text-2xl font-bold text-amber-400">{course.students.length}</p>
              </div>
              <div className="pt-3 border-t border-amber-400/20">
                <p className="text-amber-100/70 text-sm">Created</p>
                <p className="text-sm text-amber-100/80">{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-slate-800 border-2 border-amber-400/30 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-amber-400/20">
            <h2 className="text-lg font-bold text-amber-400">Enrolled Students ({course.students.length})</h2>
          </div>

          {course.students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
              <p className="text-amber-100/50">No students enrolled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50 border-b border-amber-400/20">
                  <tr>
                    <th className="text-left px-6 py-3 text-amber-400 font-semibold">#</th>
                    <th className="text-left px-6 py-3 text-amber-400 font-semibold">Student ID</th>
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
    </div>
  );
}
