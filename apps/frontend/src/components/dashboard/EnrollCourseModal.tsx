'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EnrollCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrolled: (newEnrollment: any) => void;
  token: string;
}

export const EnrollCourseModal: React.FC<EnrollCourseModalProps> = ({ isOpen, onClose, onEnrolled, token }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollment_code: code }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Invalid code or already enrolled');
      }

      const newEnrollment = await response.json();
      onEnrolled(newEnrollment);
      setCode('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Enroll in Course</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Enter the 6-character code provided by your teacher.</p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Enrollment Code"
            placeholder="e.g. AB1234"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.2rem' }}
          />

          {error && <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }} isLoading={loading}>Enroll Now</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};