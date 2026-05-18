'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, QrCode, History, Settings, LogOut } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  // Hide bottom nav on certain pages
  const hideNavRoutes = ['/login', '/register'];
  if (hideNavRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (user?.role !== 'student') {
    return null; // Hide for non-students
  }

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      href: '/student',
      active: pathname === '/student',
    },
    {
      icon: QrCode,
      label: 'Scan',
      href: '/attendance/scan',
      active: pathname === '/attendance/scan',
    },
    {
      icon: History,
      label: 'History',
      href: '/student/attendance-history',
      active: pathname === '/student/attendance-history',
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation - Only visible on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-16 transition-colors ${
                  item.active
                    ? 'text-indigo-600 border-t-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-16 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Spacer for mobile to prevent content overlap */}
      <div className="h-16 md:hidden" />
    </>
  );
}
