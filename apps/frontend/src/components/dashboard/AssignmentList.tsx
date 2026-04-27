'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  courses: { name: string };
}

interface AssignmentListProps {
  assignments: Assignment[];
  loading: boolean;
  onSubmitClick: (assignment: Assignment) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({ assignments, loading, onSubmitClick }) => {
  if (loading) {
    return <div className="spinner" style={{ margin: '2rem auto' }}></div>;
  }

  if (assignments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <p>No active assignments. Relax!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
      {assignments.map((assignment: any) => {
        const deadline = new Date(assignment.deadline);
        const isLate = new Date() > deadline;
        const isUrgent = !isLate && (deadline.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;
        const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;

        return (
          <Card key={assignment.id} className="fade-in" style={{ opacity: hasSubmitted ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                {assignment.courses.name}
              </span>
              {hasSubmitted ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>
                  ✅ Submitted
                </span>
              ) : isUrgent && (
                <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 'bold' }}>
                  ⚠️ Due Soon
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{assignment.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {assignment.description}
            </p>
            
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.4)', 
              padding: '1rem', 
              borderRadius: '10px', 
              marginBottom: '1.5rem',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>Deadline:</span>
                <span style={{ color: isLate ? 'var(--error)' : 'white', fontWeight: '600' }}>
                  {deadline.toLocaleString()}
                </span>
              </div>
            </div>

            <Button 
              variant={hasSubmitted ? 'ghost' : isLate ? 'outline' : 'primary'} 
              style={{ width: '100%' }}
              onClick={() => !hasSubmitted && onSubmitClick(assignment)}
              disabled={hasSubmitted}
            >
              {hasSubmitted ? 'Already Submitted' : isLate ? 'Submit Late' : 'Submit Assignment'}
            </Button>
          </Card>
        );
      })}
    </div>
  );
};
