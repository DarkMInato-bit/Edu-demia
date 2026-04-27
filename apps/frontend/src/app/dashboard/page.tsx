'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role === 'teacher') {
        router.push('/dashboard/teacher');
      } else if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        // Fallback if role is missing (shouldn't happen with our signup)
        router.push('/signup');
      }
    }
  }, [user, role, loading, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
    </div>
  );
}
