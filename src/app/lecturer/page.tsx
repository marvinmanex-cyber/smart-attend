'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, QrCode, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { Loader } from 'lucide-react';

export default function LecturerDashboard() {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader className="w-12 h-12 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-amber-400/20 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Smart Attend</h1>
            <p className="text-sm text-amber-100">Lecturer Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Card */}
        <div className="bg-slate-800 border border-amber-400/30 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-400 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-amber-100">
            Staff ID: <span className="font-semibold">{user?.staffId}</span>
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Session */}
          <Link
            href="/session/create"
            className="bg-slate-800 border-2 border-amber-400/30 hover:border-amber-400 rounded-lg shadow-lg hover:shadow-xl transition p-8"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-amber-500 p-4 rounded-lg">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-400">Create Session</h3>
                <p className="text-amber-100 text-sm">Generate QR code for attendance</p>
              </div>
            </div>
          </Link>

          {/* View Courses */}
          <Link
            href="/lecturer/courses"
            className="bg-slate-800 border-2 border-amber-400/30 hover:border-amber-400 rounded-lg shadow-lg hover:shadow-xl transition p-8"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-400">My Courses</h3>
                <p className="text-amber-100 text-sm">View and manage courses</p>
              </div>
            </div>
          </Link>

          {/* Create Course */}
          <Link
            href="/lecturer/courses/new"
            className="bg-slate-800 border-2 border-amber-400/30 hover:border-amber-400 rounded-lg shadow-lg hover:shadow-xl transition p-8"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-4 rounded-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-400">Create Course</h3>
                <p className="text-amber-100 text-sm">Add a new course</p>
              </div>
            </div>
          </Link>

          {/* Attendance Reports */}
          <Link
            href="/lecturer/reports"
            className="bg-slate-800 border-2 border-amber-400/30 hover:border-amber-400 rounded-lg shadow-lg hover:shadow-xl transition p-8"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 p-4 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-400">Attendance Reports</h3>
                <p className="text-amber-100 text-sm">View attendance records</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-amber-900/20 border border-amber-400/30 rounded-lg p-6">
          <h3 className="font-bold text-amber-400 mb-2">📋 Quick Guide:</h3>
          <ol className="list-decimal list-inside text-amber-100 space-y-1 text-sm">
            <li>Create a course to manage your students</li>
            <li>Start a new session to generate QR code</li>
            <li>Share the QR code with students in your class</li>
            <li>Students will scan to mark their attendance</li>
            <li>Session automatically closes after 5 minutes</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
