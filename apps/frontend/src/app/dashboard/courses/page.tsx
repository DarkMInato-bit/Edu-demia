'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  ChevronLeft, 
  User, 
  Mail, 
  FileText, 
  Download,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CoursesPage() {
  const { user, role } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'faculty' | 'students' | 'assignments'>('faculty');
  const [courseData, setCourseData] = useState<any>({ students: [], assignments: [], submissions: [] });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        fetchCourses(session.access_token);
      }
    };
    fetchSession();
  }, []);

  const fetchCourses = async (accessToken: string) => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/courses`;
      if (role === 'teacher') url = `${process.env.NEXT_PUBLIC_API_URL}/courses/teacher`;
      else if (role === 'student') url = `${process.env.NEXT_PUBLIC_API_URL}/enrollments/my`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Standardize data format (enrollments nest the course object)
        const formatted = role === 'student' ? data.map((e: any) => e.courses) : data;
        setCourses(formatted);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourseData({
          faculty: data.teacher || { name: 'Unassigned', email: 'N/A' },
          students: data.students || [],
          assignments: data.assignments || []
        });
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    fetchCourseDetails(course.id);
  };

  if (selectedCourse) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px' }}>
          <TopBar title={selectedCourse.name} />
          <main style={{ padding: '2.5rem' }}>
            {/* Back Button & Header */}
            <button 
              onClick={() => setSelectedCourse(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', marginBottom: '2rem' }}
            >
              <ChevronLeft size={20} /> Back to Catalog
            </button>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>{selectedCourse.name}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{selectedCourse.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(59, 111, 212, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                    Code: {selectedCourse.enrollment_code}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--sidebar-border)', marginBottom: '2.5rem' }}>
              {[
                { id: 'faculty', label: 'Assigned Faculty', icon: <User size={18} /> },
                { id: 'students', label: 'Enrolled Students', icon: <Users size={18} /> },
                { id: 'assignments', label: 'Curriculum & Submissions', icon: <ClipboardList size={18} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '1rem 0', background: 'transparent', border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="fade-in">
              {activeTab === 'faculty' && (
                <div className="glass-elevated" style={{ padding: '3rem', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '3rem' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '30px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '700' }}>
                    {courseData.faculty?.full_name?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{courseData.faculty?.full_name || 'Unassigned Professor'}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Senior Institutional Instructor</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                        <Mail size={18} /> {courseData.faculty?.email || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={18} color="#10b981" /> Verified Faculty
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--sidebar-border)' }}>
                        <th style={{ padding: '1.5rem' }}>Student Name</th>
                        <th style={{ padding: '1.5rem' }}>Email</th>
                        <th style={{ padding: '1.5rem' }}>Enrolled Since</th>
                        <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseData.students.map((s: any) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                          <td style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 111, 212, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700' }}>{s.full_name?.[0] || 'S'}</div>
                              <span style={{ fontWeight: '600' }}>{s.full_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                          <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                            <button style={{ background: 'transparent', border: '1px solid var(--sidebar-border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>View Submissions</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  {courseData.assignments.map((a: any) => (
                    <div key={a.id} className="glass-elevated" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', color: '#8b5cf6' }}>
                          <FileText size={20} />
                        </div>
                        <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Download size={14} /> Download All
                        </button>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{a.title}</h3>
                      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Deadline</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: '600' }}>
                            <Calendar size={14} /> {a.deadline}
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Submissions</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                            <CheckCircle2 size={14} /> {a.submission_count} Uploaded
                          </div>
                        </div>
                      </div>
                      <button style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sidebar-border)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
                        View Detailed Submissions
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <TopBar title="Academic Catalog" />
        <main style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>Institutional Catalog</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Access the complete curriculum library and management tools.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {courses.map(course => (
              <div 
                key={course.id} 
                onClick={() => handleCourseClick(course)}
                className="glass-elevated fade-in" 
                style={{ padding: '2rem', borderRadius: '28px', cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 111, 212, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} />
                  </div>
                  <MoreVertical size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(59, 111, 212, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>{course.enrollment_code}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0.5rem' }}>{course.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{course.description || 'Institutional curriculum overview pending.'}</p>
                <div style={{ borderTop: '1px solid var(--sidebar-border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Roster & Faculty</span>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem' }}>Open Hub →</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
