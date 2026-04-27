'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AssignmentListTeacher } from './AssignmentListTeacher';

interface AssignmentsByCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onViewSubmissions: (assignment: any) => void;
  token: string;
}

export const AssignmentsByCourseModal: React.FC<AssignmentsByCourseModalProps> = ({ 
  isOpen, onClose, courseId, courseName, onViewSubmissions, token 
}) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchAssignments();
    }
  }, [isOpen, courseId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setAssignments(await response.json());
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 900,
      backdropFilter: 'blur(10px)'
    }}>
      <Card style={{ width: '100%', maxWidth: '600px', margin: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Assignments</h2>
            <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{courseName}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <AssignmentListTeacher 
          assignments={assignments} 
          loading={loading} 
          onViewSubmissions={onViewSubmissions} 
        />
      </Card>
    </div>
  );
};
