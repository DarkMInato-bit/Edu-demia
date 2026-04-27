'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, BookOpen, User, Tag, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  token: string;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose, onCreated, token }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const users = await response.json();
        setTeachers(users.filter((u: any) => u.role === 'teacher' && u.is_approved));
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name, 
          description, 
          enrollment_code: enrollmentCode,
          teacher_id: teacherId || null // Admin can assign a teacher
        }),
      });

      if (response.ok) {
        onCreated();
        onClose();
        setName('');
        setDescription('');
        setEnrollmentCode('');
        setTeacherId('');
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to create course');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div className="glass-elevated" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>Initialize New Course</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={14} /> Course Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Advanced Cloud Computing"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', padding: '0.875rem 1rem', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={14} /> Enrollment Code
            </label>
            <input 
              type="text" 
              placeholder="e.g. CS301-2024"
              required
              value={enrollmentCode}
              onChange={(e) => setEnrollmentCode(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', padding: '0.875rem 1rem', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} /> Assign Professor
            </label>
            <select 
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', padding: '0.875rem 1rem', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="" style={{ background: 'var(--background)' }}>Select an approved instructor...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id} style={{ background: 'var(--background)' }}>{t.full_name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} /> Course Description
            </label>
            <textarea 
              placeholder="Brief overview of the course curriculum..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', padding: '0.875rem 1rem', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
            />
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</p>}

          <Button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', borderRadius: '12px' }}>
            {loading ? 'Initializing...' : 'Launch Course'}
          </Button>
        </form>
      </div>
    </div>
  );
};