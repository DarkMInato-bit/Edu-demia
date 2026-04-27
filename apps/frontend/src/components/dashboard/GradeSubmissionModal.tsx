'use client';

import React, { useState } from 'react';
import { X, Award, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGraded: () => void;
  submission: any;
  token: string;
}

export const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({ isOpen, onClose, onGraded, submission, token }) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${submission.id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ grade, feedback })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onGraded();
          onClose();
          setSuccess(false);
          setGrade('');
          setFeedback('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error grading submission:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-elevated fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem',
        borderRadius: '32px',
        position: 'relative',
        border: '1px solid var(--sidebar-border)'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={48} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Grade Recorded</h3>
            <p style={{ color: 'var(--text-secondary)' }}>The student has been notified of their assessment.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '12px', background: 'rgba(59, 111, 212, 0.1)', color: 'var(--primary)', borderRadius: '14px' }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>Grade Submission</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Student: {submission.student?.full_name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Official Grade</label>
                <input 
                  type="text"
                  placeholder="e.g. A+, 95/100, Excellent"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Feedback & Notes</label>
                <div style={{ position: 'relative' }}>
                  <MessageSquare size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                  <textarea 
                    placeholder="Provide constructive feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: '100%', padding: '1rem 1rem 1rem 2.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', color: 'var(--text-primary)', outline: 'none', resize: 'none'
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%', padding: '1.1rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(59, 111, 212, 0.25)', transition: 'all 0.2s', marginTop: '1rem'
                }}
              >
                {loading ? 'Recording...' : <><Send size={18} /> Submit Assessment</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
