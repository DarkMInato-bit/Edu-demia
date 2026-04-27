'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { EnrollCourseModal } from '@/components/dashboard/EnrollCourseModal';
import { SubmitAssignmentModal } from '@/components/dashboard/SubmitAssignmentModal';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  BookOpen,
  ClipboardList,
  ArrowRight,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, accent }: { label: string, value: string | number, icon: React.ReactNode, accent: string }) => (
  <div className="glass-elevated" style={{
    padding: '1.5rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    flex: 1
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      background: `${accent}20`,
      color: accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        fetchData(session.access_token);
      }
    };
    fetchSession();
  }, []);

  const fetchData = async (accessToken: string) => {
    setLoading(true);
    try {
      const [enrollRes, assignRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/my`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/student`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      ]);
      
      if (enrollRes.ok) setEnrollments(await enrollRes.json());
      if (assignRes.ok) setAssignments(await assignRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingAssignments = assignments.filter(a => !a.submissions || a.submissions.length === 0);
  const completedCount = assignments.length - pendingAssignments.length;
  const progressPercent = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <TopBar title="Student Dashboard" />
        
        <main style={{ padding: '2.5rem' }}>
          {/* Welcome Header */}
          <section className="fade-in" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, rgba(59, 111, 212, 0.1), transparent)',
            padding: '2.5rem',
            borderRadius: '24px',
            border: '1px solid var(--sidebar-border)'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Academic'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
                You have completed <strong>{progressPercent}%</strong> of your current semester goals. Keep up the momentum to finish strong!
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setIsEnrollModalOpen(true)}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Join New Course <ArrowRight size={18} />
                </button>
              </div>
            </div>
            
            {/* Progress Circle (Simplified) */}
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '12px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px', left: '-12px', right: '-12px', bottom: '-12px',
                borderRadius: '50%',
                border: '12px solid var(--primary)',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                transform: `rotate(${progressPercent * 3.6}deg)`,
                transition: 'transform 1s ease-out'
              }} />
              <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{progressPercent}%</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Completed</span>
            </div>
          </section>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
            <StatCard label="Assignments" value={assignments.length} icon={<ClipboardList size={24} />} accent="#3b6fd4" />
            <StatCard label="Pending" value={pendingAssignments.length} icon={<Clock size={24} />} accent="#f59e0b" />
            <StatCard label="Completed" value={completedCount} icon={<CheckCircle size={24} />} accent="#10b981" />
            <StatCard label="Courses" value={enrollments.length} icon={<BookOpen size={24} />} accent="#8b5cf6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
            <div> {/* Left Column: Activities */}
              {/* Pending Assignments */}
              <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Pending Assignments</h2>
                <Link href="/dashboard/assignments" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>View All</Link>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                  <div className="spinner" style={{ margin: '2rem auto' }}></div>
                ) : pendingAssignments.length === 0 ? (
                  <div className="glass" style={{ padding: '3rem', borderRadius: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>All caught up! No pending assignments.</p>
                  </div>
                ) : (
                  pendingAssignments.map(a => (
                    <div key={a.id} className="glass" style={{
                      padding: '1.5rem',
                      borderRadius: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          📚
                        </div>
                        <div>
                          <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{a.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.courses.name}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Due Date</p>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{new Date(a.deadline).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedAssignment(a)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--text-primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Graded Submissions */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Graded Submissions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {assignments.filter(a => a.submissions?.length > 0 && a.submissions[0].grade).length === 0 ? (
                  <div className="glass" style={{ padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No graded submissions yet.</p>
                  </div>
                ) : (
                  assignments.filter(a => a.submissions?.length > 0 && a.submissions[0].grade).map(a => (
                    <div key={a.id} className="glass-elevated" style={{
                      padding: '1.5rem',
                      borderRadius: '20px',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{a.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.courses.name}</p>
                        </div>
                        <div style={{ 
                          background: 'rgba(16, 185, 129, 0.1)', 
                          color: '#10b981', 
                          padding: '6px 12px', 
                          borderRadius: '10px', 
                          fontWeight: '800', 
                          fontSize: '1rem' 
                        }}>
                          {a.submissions[0].grade}
                        </div>
                      </div>
                      {a.submissions[0].feedback && (
                        <div style={{ 
                          padding: '1rem', 
                          background: 'rgba(255,255,255,0.02)', 
                          borderRadius: '12px', 
                          fontSize: '0.875rem', 
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Feedback:</span>
                          "{a.submissions[0].feedback}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

            {/* Right Column: Courses */}
            <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>My Courses</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {enrollments.map(e => (
                  <div key={e.id} className="glass-elevated" style={{
                    padding: '1.25rem',
                    borderRadius: '20px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        background: 'var(--primary)', 
                        color: 'white', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px', 
                        fontWeight: '700' 
                      }}>
                        {e.courses.enrollment_code}
                      </span>
                      <MoreVertical size={16} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                    </div>
                    <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{e.courses.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      Prof. {e.courses.teacher?.full_name || 'Instructor'}
                    </p>
                    
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '0.5rem' }}>
                      <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '600' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      <span style={{ color: 'var(--primary)' }}>75%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      <EnrollCourseModal 
        isOpen={isEnrollModalOpen} 
        onClose={() => setIsEnrollModalOpen(false)} 
        onEnrolled={() => token && fetchData(token)}
        token={token || ''}
      />

      <SubmitAssignmentModal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onSubmitted={() => token && fetchData(token)}
        assignment={selectedAssignment}
        token={token || ''}
      />
    </div>
  );
}