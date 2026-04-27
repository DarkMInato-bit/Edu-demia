'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { GraduationCap, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'var(--primary)',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.05,
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'var(--accent)',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.05,
        zIndex: 0
      }} />

      {/* Header Branding */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', zIndex: 1 }}>
        <div style={{ 
          background: 'var(--sidebar-bg)', 
          width: '64px', 
          height: '64px', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '1px solid var(--sidebar-border)'
        }}>
          <GraduationCap size={32} style={{ color: 'var(--primary)' }} />
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          fontFamily: 'Playfair Display, serif',
          letterSpacing: '0.02em',
          marginBottom: '0.5rem'
        }}>
          Scholar EDU
        </h1>
        <p style={{ 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em', 
          color: 'var(--text-secondary)',
          fontWeight: '600'
        }}>
          University Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-elevated" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        borderRadius: '24px',
        zIndex: 1
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
          Welcome Back
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2.5rem' }}>
          Please enter your credentials to access your academic dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} /> Student Email
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                placeholder="e.g. s.doe@scholar.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--sidebar-border)',
                  padding: '1rem',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={14} /> Password
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Forgot?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--sidebar-border)',
                  padding: '1rem',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <input type="checkbox" id="remember" style={{ accentColor: 'var(--primary)' }} />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Remember this device</label>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

          <Button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px', 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In to Portal <ArrowRight size={18} /></>
            )}
          </Button>
        </form>

        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Need technical assistance? <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Contact IT Support</span>
          </p>
        </div>
      </div>

      <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem', zIndex: 1 }}>
        New student? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Request account</Link>
      </p>

      {/* Footer Details */}
      <footer style={{ position: 'absolute', bottom: '2rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.75rem', color: '#475569', zIndex: 1 }}>
        <span>© 2024 Scholar EDU. All rights reserved.</span>
        <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
        <span style={{ cursor: 'pointer' }}>Terms of Service</span>
      </footer>
    </div>
  );
}
