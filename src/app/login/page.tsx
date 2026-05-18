'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth_service';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await AuthService.signIn(email, password);
      
      // Route based on role (Just like your Flutter logic!)
      if (user.role === 'staff') {
        router.push('/lecturer');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-primary p-8 text-center">
          <h1 className="text-3xl font-bold text-secondary">SmartAttend</h1>
          <p className="text-blue-100 mt-2">Sign in to your account</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-error p-4 text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="e.g. name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-bold text-primary transition ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-secondary hover:bg-yellow-500'
            }`}
          >
            {loading ? 'Authenticating...' : 'LOG IN'}
          </button>

          <div className="text-center pt-4">
            <p className="text-textLight text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}