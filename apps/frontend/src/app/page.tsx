'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 🏛️ Institutional Redirect: Escort all root visitors to the Login Gateway
    router.push('/login');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'var(--background)' 
    }}>
      <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
    </div>
  );
}
