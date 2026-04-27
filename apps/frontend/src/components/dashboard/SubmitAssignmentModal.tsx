'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Upload, CheckCircle, Clock, FileText, AlertCircle, ChevronRight } from 'lucide-react';

interface SubmitAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  assignment: any;
  token: string;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({ isOpen, onClose, onSubmitted, assignment, token }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevSubmissions, setPrevSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchHistory();
      // Reset state when opening a new assignment
      setFile(null);
      setTitle('');
      setConfirmed(false);
      setError(null);
    }
  }, [isOpen, assignment]);

  const fetchHistory = async () => {
    // History fetching logic here
  };

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !confirmed) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/${assignment.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        onSubmitted();
        onClose();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Submission failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'var(--background)', 
      display: 'flex', 
      flexDirection: 'column',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      {/* Top Header */}
      <nav style={{
        height: '70px',
        borderBottom: '1px solid var(--sidebar-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        background: 'var(--sidebar-bg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span>Courses</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{assignment.title}</span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2.5rem', width: '100%' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
            {assignment.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Individual Research Paper • {assignment.courses.name}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
          {/* Left Column: Instructions */}
          <div>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FileText size={28} style={{ color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Assignment Instructions</h2>
              </div>
              
              <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                  {assignment.description || "For this assignment, you are required to submit your research through the portal below. Ensure all components are included."}
                </p>
                
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: '700' }}>Required Components:</h4>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Executive Summary:</strong> A concise description of your findings.</li>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Analysis:</strong> Detailed explanation of the chosen methodology.</li>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Mitigation Strategy:</strong> Proposed alternative frameworks.</li>
                </ul>

                <div style={{ 
                  background: 'rgba(59, 111, 212, 0.05)', 
                  borderLeft: '4px solid var(--primary)', 
                  padding: '1.5rem',
                  borderRadius: '0 12px 12px 0',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <AlertCircle size={20} style={{ color: 'var(--primary)' }} />
                  <p style={{ fontSize: '0.875rem' }}>
                    Submissions must be in PDF format. Minimum word count: 2,500 words.
                  </p>
                </div>
              </div>
            </div>

            {/* Previous Submissions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Clock size={22} style={{ color: 'var(--text-secondary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Previous Submissions</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--sidebar-border)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Version</th>
                    <th style={{ padding: '1rem' }}>Filename</th>
                    <th style={{ padding: '1rem' }}>Date Submitted</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No previous versions found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Portal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Overview */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="glass" style={{ flex: 1, padding: '1.25rem', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Due Date</p>
                <p style={{ fontWeight: '700' }}>{new Date(assignment.deadline).toLocaleDateString()}</p>
              </div>
              <div className="glass" style={{ flex: 1, padding: '1.25rem', borderRadius: '16px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Weight</p>
                <p style={{ fontWeight: '700' }}>15% of Grade</p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="glass-elevated" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px' }}>
                  <Upload size={20} />
                </div>
                <h3 style={{ fontWeight: '700' }}>Submission Portal</h3>
              </div>

              <form onSubmit={handleSubmit}>
                <label 
                  htmlFor="fileInput"
                  style={{
                    border: '2px dashed var(--sidebar-border)',
                    borderRadius: '16px',
                    padding: '3rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: file ? 'rgba(59, 111, 212, 0.05)' : 'transparent',
                    borderColor: file ? 'var(--primary)' : 'var(--sidebar-border)'
                  }}
                >
                  <input 
                    type="file" 
                    id="fileInput" 
                    style={{ display: 'none' }} 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Upload size={24} style={{ color: 'var(--background)' }} />
                  </div>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {file ? file.name : "Drag & drop your file"}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Supported formats: PDF, DOCX (Max 25MB)
                  </p>
                  {!file && (
                    <div style={{ 
                      marginTop: '1.5rem', 
                      padding: '0.5rem 1.5rem', 
                      border: '1px solid var(--sidebar-border)', 
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      Browse Files
                    </div>
                  )}
                </label>

                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>Submission Title</p>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Final Revision" 
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--sidebar-border)',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginBottom: '1.5rem'
                    }}
                  />
                  
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                    <input 
                      type="checkbox" 
                      id="confirm" 
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      style={{ marginTop: '3px' }} 
                      required 
                    />
                    <label htmlFor="confirm" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      I confirm that this is my own work and complies with academic integrity policies.
                    </label>
                  </div>

                  {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

                  <Button 
                    type="submit" 
                    disabled={!file || !confirmed || loading}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '10px', justifyContent: 'center' }}
                  >
                    {loading ? 'Uploading...' : 'Submit Final Version'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Grading Status */}
            <div className="glass" style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              background: 'linear-gradient(135deg, #0a1120, #080d17)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', bottom: '-20px', right: '-20px', 
                fontSize: '100px', opacity: 0.03, transform: 'rotate(-15deg)' 
              }}>⭐</div>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>Current Status</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Awaiting Grading</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Your final submission will be graded by your instructor within 7 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
