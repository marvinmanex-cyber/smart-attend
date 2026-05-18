'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRouteWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAuth();

  useEffect(() => {
    // Skip protection for public routes
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // If still loading, don't redirect yet
    if (status === 'loading') {
      return;
    }

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // If authenticated, check role-based access
    if (user) {
      // Students trying to access lecturer routes
      if (
        user.role === 'student' &&
        (pathname.startsWith('/lecturer') || pathname.startsWith('/session'))
      ) {
        router.push('/student');
        return;
      }

      // Staff/Lecturers trying to access student routes
      if (
        user.role === 'staff' &&
        pathname.startsWith('/attendance/scan')
      ) {
        router.push('/lecturer');
        return;
      }
    }
  }, [pathname, status, user, router]);

  return <>{children}</>;
}
