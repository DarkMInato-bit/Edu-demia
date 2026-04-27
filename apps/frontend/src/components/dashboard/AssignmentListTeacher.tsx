'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
}

interface AssignmentListTeacherProps {
  assignments: Assignment[];
  loading: boolean;
  onViewSubmissions: (assignment: Assignment) => void;
}

export const AssignmentListTeacher: React.FC<AssignmentListTeacherProps> = ({ assignments, loading, onViewSubmissions }) => {
  if (loading) return <div className="spinner" style={{ margin: '2rem auto' }}></div>;

  if (assignments.length === 0) {
    return <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No assignments posted yet.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      {assignments.map(a => (
        <div key={a.id} style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '1rem',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{a.title}</h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Due: {new Date(a.deadline).toLocaleString()}
            </p>
          </div>
          <Button variant="ghost" onClick={() => onViewSubmissions(a)}>
            View Submissions →
          </Button>
        </div>
      ))}
    </div>
  );
};
