'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Course } from '@/types';
import { Loader, Plus, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LecturerCoursesPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (user?.role !== 'staff') {
      setError('Only lecturers can access this page');
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        const lecturerCourses = await FirestoreService.getCoursesByLecturer(user.uid);
        setCourses(lecturerCourses);
        setError('');
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchCourses();
    }
  }, [user, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader className="w-12 h-12 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/lecturer" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-amber-400 mb-2">My Courses</h1>
          <p className="text-amber-100">Manage your courses and students</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Create Course Button */}
        <Link
          href="/lecturer/courses/new"
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 rounded-lg font-bold transition mb-8"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Course</span>
        </Link>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-slate-800 border-2 border-amber-400/30 rounded-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <p className="text-amber-100/70 mb-4">No courses yet</p>
            <Link
              href="/lecturer/courses/new"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/lecturer/courses/${course.id}`}
                className="bg-slate-800 border-2 border-amber-400/30 hover:border-amber-400 rounded-lg p-6 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-400 group-hover:text-amber-300 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-amber-100/70 text-sm font-mono">{course.code}</p>
                  </div>
                </div>

                <p className="text-amber-100/80 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center space-x-4 pt-4 border-t border-amber-400/20">
                  <div className="flex items-center space-x-2 text-amber-100/70 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{course.students.length} students</span>
                  </div>
                  <div className="text-amber-100/70 text-xs">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
