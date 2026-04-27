'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Course {
  id: string;
  name: string;
}

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  courses: Course[];
  token: string;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, onCreated, courses, token }) => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          course_id: courseId, 
          title, 
          description, 
          deadline: new Date(deadline).toISOString() 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to post assignment');
      }

      onCreated();
      setTitle('');
      setDescription('');
      setDeadline('');
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
      <Card style={{ width: '100%', maxWidth: '500px', margin: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Post New Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Select Course</label>
            <select 
              className="input-field" 
              value={courseId} 
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>)}
            </select>
          </div>

          <Input 
            label="Assignment Title" 
            placeholder="e.g. Project Proposal" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />

          <div className="input-group">
            <label className="input-label">Description / Instructions</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '80px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input 
            label="Deadline" 
            type="datetime-local" 
            value={deadline} 
            onChange={(e) => setDeadline(e.target.value)} 
            required 
          />

          {error && <p style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button type="submit" variant="secondary" style={{ flex: 1 }} isLoading={loading}>Post Assignment</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
