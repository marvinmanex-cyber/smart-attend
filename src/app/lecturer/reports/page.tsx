'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Course, StudentAttendance } from '@/types';
import { Loader, Download, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AttendanceReportsPage() {
  const { user, status } = useAuth();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!courseId) return;

        // Fetch course details
        const courseQuery = await FirestoreService.getSessionById(courseId);
        setCourse(courseQuery as any);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [courseId, status]);

  const handleDownloadReport = () => {
    if (!attendance.length) return;

    const csv = [
      ['Student Name', 'Student ID', 'Marked At', 'Time'],
      ...attendance.map((a) => [
        a.studentName,
        a.studentId,
        new Date(a.markedAt).toLocaleDateString(),
        new Date(a.markedAt).toLocaleTimeString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedSession}-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
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
        <Link href="/lecturer/courses" className="text-amber-400 hover:text-amber-300 text-sm mb-4 inline-block">
          ← Back to Courses
        </Link>
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Attendance Reports</h1>
        <p className="text-amber-100 mb-8">View and export attendance records</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Report Content */}
        <div className="bg-slate-800 border-2 border-amber-400/30 rounded-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-amber-400">
              {course?.title || 'Course Attendance'}
            </h2>
          </div>

          {attendance.length > 0 && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-semibold mb-6 transition"
            >
              <Download className="w-5 h-5" />
              <span>Download CSV Report</span>
            </button>
          )}

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-400/20">
                  <th className="text-left px-4 py-3 text-amber-400 font-semibold">Student Name</th>
                  <th className="text-left px-4 py-3 text-amber-400 font-semibold">Student ID</th>
                  <th className="text-left px-4 py-3 text-amber-400 font-semibold">Marked Date</th>
                  <th className="text-left px-4 py-3 text-amber-400 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-amber-100/50">
                      No attendance records yet
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="border-b border-amber-400/10 hover:bg-amber-400/5 transition">
                      <td className="px-4 py-3 text-amber-100">{record.studentName}</td>
                      <td className="px-4 py-3 text-amber-100/70 font-mono text-xs">{record.studentId}</td>
                      <td className="px-4 py-3 text-amber-100/70">
                        {new Date(record.markedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-amber-100/70">
                        {new Date(record.markedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {attendance.length > 0 && (
            <div className="mt-6 p-4 bg-amber-400/10 border border-amber-400/30 rounded-lg">
              <p className="text-amber-100 text-sm">
                <span className="font-semibold">Total Students Marked:</span> {attendance.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
