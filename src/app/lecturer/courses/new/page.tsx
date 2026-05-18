'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FirestoreService } from '@/services/firestore_service';
import { Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateCoursePage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user?.uid || !user?.name) {
        throw new Error('User information not found');
      }

      await FirestoreService.createCourse(
        user.uid,
        user.name,
        formData.code,
        formData.title,
        formData.description
      );

      router.push('/lecturer/courses');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Link href="/login" className="text-amber-400">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/lecturer/courses"
          className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </Link>

        <h1 className="text-3xl font-bold text-amber-400 mb-2">Create New Course</h1>
        <p className="text-amber-100 mb-8">Add a new course to manage attendance</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 border-2 border-amber-400/30 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Course Code */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Course Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., CS101"
              required
              className="w-full bg-slate-700 border border-amber-400/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/50 focus:border-amber-400 focus:outline-none transition"
            />
            <p className="text-amber-100/50 text-xs mt-1">e.g., CS101, MTH201</p>
          </div>

          {/* Course Title */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Computer Science"
              required
              className="w-full bg-slate-700 border border-amber-400/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/50 focus:border-amber-400 focus:outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-amber-400 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter course description..."
              rows={5}
              required
              className="w-full bg-slate-700 border border-amber-400/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-100/50 focus:border-amber-400 focus:outline-none transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 text-slate-900 disabled:text-slate-400 font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Course</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
