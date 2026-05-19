'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { StudentAttendance } from '@/types';
import { Loader, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AttendanceHistoryPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<StudentAttendance[]>([]);
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

    const fetchAttendance = async () => {
      try {
        const q = query(
          collection(db, 'student_attendance'),
          where('studentId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const data: StudentAttendance[] = [];
        snapshot.forEach((doc) => {
          data.push(doc.data() as StudentAttendance);
        });
        // Sort by most recent first
        data.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());
        setRecords(data);
        setError('');
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchAttendance();
    }
  }, [user, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-4 pb-24 md:pb-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Attendance History</h1>
          <p className="text-xs md:text-sm text-gray-600">Your attendance records</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">{records.length}</div>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Classes Marked</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {new Set(records.map(r => r.courseId)).size}
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Courses</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {records.filter(r => new Date(r.markedAt).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1">This Month</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 md:p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm md:text-base mb-2">No attendance records yet</p>
            <p className="text-gray-500 text-xs md:text-sm">
              Mark attendance by scanning QR codes in your classes.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.courseId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(record.markedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          <span>Present</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {records.map((record) => (
                <div key={record.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{record.courseId}</h3>
                    <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Present</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><span className="font-semibold">Date:</span> {new Date(record.markedAt).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Time:</span> {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs md:text-sm">
            <p className="text-blue-800">
              <span className="font-semibold">📊 Note:</span> Records show your actual marked attendance from all sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
