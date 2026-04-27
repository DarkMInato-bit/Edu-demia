'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const userRole = user?.user_metadata?.role || 'student';
  let dashboardPath = '/dashboard/student';
  if (userRole === 'teacher') dashboardPath = '/dashboard/teacher';
  if (userRole === 'admin') dashboardPath = '/dashboard/admin';

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: dashboardPath },
    { icon: <BookOpen size={20} />, label: userRole === 'teacher' ? 'My Courses' : 'Courses', path: '/dashboard/courses' },
    ...(userRole !== 'admin' ? [{ icon: <ClipboardList size={20} />, label: userRole === 'teacher' ? 'Submissions' : 'Assignments', path: '/dashboard/assignments' }] : []),
  ];

  if (userRole === 'admin') {
    menuItems.push({ icon: <ShieldCheck size={20} />, label: 'Admin Panel', path: '/dashboard/admin' });
  }

  if (userRole === 'student') {
    menuItems.push({ icon: <GraduationCap size={20} />, label: 'Grades', path: '/dashboard/grades' });
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1rem',
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
      {/* Branding */}
      <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
        <h2 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '700', 
          fontFamily: 'Playfair Display, serif',
          color: 'var(--primary)',
          letterSpacing: '-0.03em'
        }}>
          Academia
        </h2>
        <p style={{ 
          fontSize: '0.65rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em', 
          color: 'var(--text-secondary)',
          marginTop: '0.25rem',
          fontWeight: '700'
        }}>
          University Portal
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/dashboard' && pathname.startsWith('/dashboard/student'));
          return (
            <Link key={item.label} href={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                marginBottom: '0.5rem',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(59, 111, 212, 0.1)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}>
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: '1.5rem' }}>
        {/* Theme Toggle */}
        <div 
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            background: 'var(--background)',
            border: '1px solid var(--sidebar-border)'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0.5rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            {userDisplayName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {userDisplayName}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {user?.user_metadata?.role || 'Student'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <div 
          onClick={signOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            color: 'var(--error)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};
