'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ClipboardList, CheckCircle, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { SubmitAssignmentModal } from '@/components/dashboard/SubmitAssignmentModal';
import { GradeSubmissionModal } from '@/components/dashboard/GradeSubmissionModal';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        fetchAssignments(session.access_token);
      }
    };
    fetchSession();
  }, []);

  const fetchAssignments = async (accessToken: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;
      
      let url = `${process.env.NEXT_PUBLIC_API_URL}/assignments/student`;
      if (role === 'teacher') url = `${process.env.NEXT_PUBLIC_API_URL}/submissions/teacher`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.ok) {
        setAssignments(await response.json());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (a: any) => {
    const isSubmitted = (a.submission_status && a.submission_status !== 'pending') || (a.submissions && a.submissions.length > 0);
    const isOverdue = !isSubmitted && new Date() > new Date(a.deadline);

    if (isSubmitted) {
      return (
        <span style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          color: '#10b981', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle size={14} /> Submitted
        </span>
      );
    }

    if (isOverdue) {
      return (
        <span style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertCircle size={14} /> Overdue
        </span>
      );
    }

    return (
      <span style={{ 
        background: 'rgba(245, 158, 11, 0.1)', 
        color: '#f59e0b', 
        padding: '4px 12px', 
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Clock size={14} /> Pending
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <TopBar title="Assignment Center" />
        
        <main style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
              {user?.user_metadata?.role === 'teacher' ? 'Student Submissions' : 'Assignment Activity'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {user?.user_metadata?.role === 'teacher' 
                ? 'Review and manage files uploaded by your students.' 
                : 'Track your submissions and upcoming deadlines across all courses.'}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <div className="spinner"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="glass" style={{ padding: '5rem', borderRadius: '24px', textAlign: 'center' }}>
              <ClipboardList size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', opacity: 0.5 }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Assignments</h2>
              <p style={{ color: 'var(--text-secondary)' }}>You don't have any assignments yet.</p>
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    textAlign: 'left', 
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--sidebar-border)', 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <th style={{ padding: '1.25rem 2rem' }}>{user?.user_metadata?.role === 'teacher' ? 'Student' : 'Assignment'}</th>
                    <th style={{ padding: '1.25rem' }}>{user?.user_metadata?.role === 'teacher' ? 'Task / Course' : 'Course'}</th>
                    <th style={{ padding: '1.25rem' }}>{user?.user_metadata?.role === 'teacher' ? 'Submitted At' : 'Due Date'}</th>
                    <th style={{ padding: '1.25rem' }}>Status</th>
                    <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, i) => (
                    <tr key={a.id} style={{ 
                      borderBottom: i === assignments.length - 1 ? 'none' : '1px solid var(--sidebar-border)',
                      transition: 'background 0.2s',
                    }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 111, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} style={{ color: 'var(--primary)' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {user?.user_metadata?.role === 'teacher' ? a.student?.full_name : a.title}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {user?.user_metadata?.role === 'teacher' ? a.file_name : `ID: ${a.id.slice(0, 8)}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {user?.user_metadata?.role === 'teacher' ? `${a.assignment?.title} (${a.assignment?.courses?.name})` : a.courses.name}
                        </span>
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          {new Date(user?.user_metadata?.role === 'teacher' ? a.submitted_at : a.deadline).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        {user?.user_metadata?.role === 'teacher' ? (
                          <span style={{ background: a.is_late ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: a.is_late ? '#ef4444' : '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {a.is_late ? 'Late Submission' : 'On Time'}
                          </span>
                        ) : getStatusBadge(a)}
                      </td>
                      <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          {user?.user_metadata?.role === 'teacher' ? (
                            <>
                              <button 
                                onClick={async () => {
                                   try {
                                     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/download?fileUrl=${encodeURIComponent(a.file_url)}`, {
                                       headers: { 'Authorization': `Bearer ${token}` }
                                     });
                                     if (res.ok) {
                                       const { url } = await res.json();
                                       window.open(url, '_blank');
                                     } else {
                                       alert('Failed to generate download link.');
                                     }
                                   } catch (err) {
                                     console.error('Download failed:', err);
                                     alert('An error occurred during download.');
                                   }
                                }}
                                style={{ background: 'transparent', border: '1px solid var(--sidebar-border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                              >
                                Download
                              </button>
                              <button 
                                onClick={() => setGradingSubmission(a)}
                                style={{ background: a.grade ? 'rgba(16, 185, 129, 0.1)' : 'var(--primary)', color: a.grade ? '#10b981' : 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                              >
                                {a.grade ? 'Regrade' : 'Grade'}
                              </button>
                            </>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              {(a.submission_status && a.submission_status !== 'pending') || (a.submissions && a.submissions.length > 0) ? (
                                <button 
                                  onClick={async (e) => {
                                    const btn = e.currentTarget;
                                    const originalText = btn.innerText;
                                    const sub = a.submissions?.[0];
                                    const fileUrl = sub?.file_url;
                                    
                                    if (!fileUrl) {
                                      alert('No submission file found.');
                                      return;
                                    }

                                    try {
                                      btn.innerText = 'Downloading...';
                                      btn.disabled = true;
                                      
                                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submissions/download?fileUrl=${encodeURIComponent(fileUrl)}`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      });
                                      
                                      if (res.ok) {
                                        const { url } = await res.json();
                                        window.open(url, '_blank');
                                      } else {
                                        alert('Failed to generate download link.');
                                      }
                                    } catch (err) {
                                      console.error('Download failed:', err);
                                      alert('An error occurred while downloading.');
                                    } finally {
                                      btn.innerText = originalText;
                                      btn.disabled = false;
                                    }
                                  }}
                                  style={{ background: 'transparent', border: '1px solid var(--sidebar-border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                  Download
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setSelectedAssignment(a)}
                                  style={{ 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '6px 16px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Submit Now
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <GradeSubmissionModal 
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        onGraded={() => token && fetchAssignments(token)}
        submission={gradingSubmission}
        token={token || ''}
      />

      <SubmitAssignmentModal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        assignment={selectedAssignment}
        token={token || ''}
        onSubmitted={() => token && fetchAssignments(token)}
      />
    </div>
  );
}
