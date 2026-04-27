'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  Trophy,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function GradesPage() {
  const { user } = useAuth();
  const [gradedAssignments, setGradedAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/student`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Filter only graded ones
            const graded = data.filter((a: any) => a.submissions?.length > 0 && a.submissions[0].grade);
            setGradedAssignments(graded);
          }
        } catch (err) {
          console.error('Error fetching grades:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <TopBar title="Official Transcript" />
        <main style={{ padding: '2.5rem' }}>
          
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>Academic Performance</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Review your finalized grades and institutional feedback.</p>
          </div>


          {/* Detailed Grades List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <div className="spinner"></div>
              </div>
            ) : gradedAssignments.length === 0 ? (
              <div className="glass" style={{ padding: '5rem', borderRadius: '24px', textAlign: 'center' }}>
                <GraduationCap size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Finalized Grades</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Your official grades will appear here once faculty review is complete.</p>
              </div>
            ) : (
              gradedAssignments.map(a => (
                <div key={a.id} className="glass-elevated fade-in" style={{ padding: '2rem', borderRadius: '28px', borderLeft: '6px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', color: 'var(--primary)' }}>
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>{a.title}</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: '600' }}>{a.courses.name}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> Graded on {new Date(a.submissions[0].graded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', lineHeight: '1' }}>{a.submissions[0].grade}</div>
                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Final Score</p>
                    </div>
                  </div>

                  {a.submissions[0].feedback && (
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '18px', 
                      border: '1px solid var(--sidebar-border)',
                      position: 'relative'
                    }}>
                      <MessageSquare size={16} style={{ position: 'absolute', top: '1rem', right: '1.5rem', color: 'var(--primary)', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Faculty Feedback</p>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontStyle: 'italic' }}>
                        "{a.submissions[0].feedback}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
