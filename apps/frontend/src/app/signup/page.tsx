'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { GraduationCap, User, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password, fullName, role);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      position: 'relative',
      padding: '2rem'
    }}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          background: 'var(--sidebar-bg)', 
          width: '56px', 
          height: '56px', 
          borderRadius: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1rem',
          border: '1px solid var(--sidebar-border)'
        }}>
          <GraduationCap size={28} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>
          Create Account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Join the Scholar EDU academic community</p>
      </div>

      <div className="glass-elevated" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem',
        borderRadius: '24px'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div 
              onClick={() => setRole('student')}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '12px',
                border: `1px solid ${role === 'student' ? 'var(--primary)' : 'var(--sidebar-border)'}`,
                background: role === 'student' ? 'rgba(59, 111, 212, 0.05)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <User size={20} style={{ color: role === 'student' ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: role === 'student' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>STUDENT</p>
            </div>
            <div 
              onClick={() => setRole('teacher')}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '12px',
                border: `1px solid ${role === 'teacher' ? 'var(--primary)' : 'var(--sidebar-border)'}`,
                background: role === 'teacher' ? 'rgba(59, 111, 212, 0.05)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              <UserCheck size={20} style={{ color: role === 'teacher' ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: role === 'teacher' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>TEACHER</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
            <input 
              type="text"
              placeholder="Enter your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--sidebar-border)',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
            <input 
              type="email"
              placeholder="name@university.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--sidebar-border)',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Password</label>
            <input 
              type="password"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--sidebar-border)',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

          <Button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? 'Creating Account...' : (
              <>Register for Access <ArrowRight size={18} /></>
            )}
          </Button>
        </form>
      </div>

      <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign in here</Link>
      </p>
    </div>
  );
}
