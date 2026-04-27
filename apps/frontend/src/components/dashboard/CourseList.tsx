'use client';

import React from 'react';
import { Card } from '../ui/Card';

interface Course {
  id: string;
  name: string;
  description: string;
  enrollment_code: string;
  created_at: string;
}

interface CourseListProps {
  courses: Course[];
  loading: boolean;
  onViewAssignments?: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, loading, onViewAssignments }) => {
  if (loading) {
    return <div className="spinner" style={{ margin: '2rem auto' }}></div>;
  }

  if (courses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <p>No courses found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {courses.map((course) => (
        <Card key={course.id} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{course.name}</h3>
            <span style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--primary)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              {course.enrollment_code}
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '3rem' }}>
            {course.description || 'No description provided.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
            {onViewAssignments && (
              <span 
                onClick={() => onViewAssignments(course.id)} 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
              >
                View Assignments →
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
