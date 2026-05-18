'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, QrCode, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Loader } from 'lucide-react';

export default function StudentDashboard() {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Smart Attend</h1>
            <p className="text-xs md:text-sm text-gray-600">Student Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Matric Number: <span className="font-semibold">{user?.matricNumber}</span>
          </p>
        </div>

        {/* Quick Actions Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
          {/* Mark Attendance */}
          <Link
            href="/attendance"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-4 md:p-8 border-l-4 border-indigo-600 active:scale-95"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="bg-indigo-600 p-3 md:p-4 rounded-lg flex-shrink-0">
                <QrCode className="w-6 md:w-8 h-6 md:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Mark Attendance</h3>
                <p className="text-gray-600 text-xs md:text-sm">Scan QR code</p>
              </div>
            </div>
          </Link>

          {/* View Courses */}
          <Link
            href="/attendance"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-4 md:p-8 border-l-4 border-blue-600 active:scale-95"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="bg-blue-600 p-3 md:p-4 rounded-lg flex-shrink-0">
                <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">My Courses</h3>
                <p className="text-gray-600 text-xs md:text-sm">View courses</p>
              </div>
            </div>
          </Link>

          {/* Attendance History */}
          <Link
            href="/student/attendance-history"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-4 md:p-8 border-l-4 border-green-600 active:scale-95"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="bg-green-600 p-3 md:p-4 rounded-lg flex-shrink-0">
                <BarChart3 className="w-6 md:w-8 h-6 md:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">History</h3>
                <p className="text-gray-600 text-xs md:text-sm">Your records</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-xs md:text-sm">
          <p className="text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Tap "Mark Attendance" to scan QR code during class.
          </p>
        </div>
      </main>
    </div>
  );
}
