'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  UserCheck, 
  Plus, 
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Mail,
  GraduationCap,
  Settings,
  Edit,
  Trash2,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CreateCourseModal } from '@/components/dashboard/CreateCourseModal';

const AdminStatCard = ({ label, value, icon, accent }: { label: string, value: string | number, icon: React.ReactNode, accent: string }) => (
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'teachers' | 'students'>('teachers');
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Modals for deep management
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
      const [userRes, courseRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/courses`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
      ]);

      if (userRes.ok) setUsers(await userRes.json());
      if (courseRes.ok) setCourses(await courseRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/approve/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchData(token);
    } catch (err) {
      console.error('Error approving teacher:', err);
    }
  };

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  const pendingCount = teachers.filter(t => !t.is_approved).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <TopBar title="Institutional Control" />
        
        <main style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '10px' }}>
                  <ShieldCheck size={24} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>University Command Center</h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage high-level academic operations and faculty credentials.</p>
            </div>
            <button 
              onClick={() => setIsCourseModalOpen(true)}
              style={{
                background: 'var(--primary)', color: 'white', border: 'none', padding: '0.875rem 1.75rem',
                borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 8px 24px rgba(59, 111, 212, 0.25)'
              }}
            >
              <Plus size={20} /> Create New Course
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
            <AdminStatCard label="Total Faculty" value={teachers.length} icon={<Users size={24} />} accent="#3b6fd4" />
            <AdminStatCard label="Pending Review" value={pendingCount} icon={<UserCheck size={24} />} accent="#f59e0b" />
            <AdminStatCard label="Live Courses" value={courses.length} icon={<BookOpen size={24} />} accent="#8b5cf6" />
            <AdminStatCard label="Total Students" value={students.length} icon={<GraduationCap size={24} />} accent="#10b981" />
          </div>

          {/* Management Area */}
          <section className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--sidebar-border)' }}>
              {[
                { id: 'teachers', label: `Faculty (${teachers.length})`, icon: <Users size={18} /> },
                { id: 'courses', label: `Course Catalog (${courses.length})`, icon: <BookOpen size={18} /> },
                { id: 'students', label: `Student Directory (${students.length})`, icon: <GraduationCap size={18} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '1.25rem 2rem', background: 'transparent', border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {activeTab === 'teachers' && (
                <div className="fade-in">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '1rem' }}>Faculty Member</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Joined</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(teacher => (
                        <tr key={teacher.id} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                          <td style={{ padding: '1.5rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{teacher.full_name[0]}</div>
                              <span style={{ fontWeight: '600' }}>{teacher.full_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{teacher.email}</td>
                          <td style={{ padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{new Date(teacher.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1.5rem 1rem' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: teacher.is_approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: teacher.is_approved ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>
                              {teacher.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                            {!teacher.is_approved ? (
                              <button onClick={() => handleApprove(teacher.id)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
                            ) : (
                              <button 
                                onClick={() => { setSelectedUser(teacher); setIsUserModalOpen(true); }}
                                style={{ background: 'transparent', border: '1px solid var(--sidebar-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
                              >
                                Manage
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="fade-in">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {courses.map(course => (
                      <div key={course.id} className="glass-elevated" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(59, 111, 212, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{course.enrollment_code}</span>
                          <MoreVertical size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{course.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{course.description || 'Institutional curriculum overview pending.'}</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--sidebar-border)' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Students</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>{course.student_count}</p>
                          </div>
                          <div style={{ flex: 2, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--sidebar-border)' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Instructor</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.teacher_name}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--sidebar-border)', paddingTop: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>P</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Faculty Assigned</span>
                          </div>
                          <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>Edit Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="fade-in">
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '1rem' }}>Student Name</th>
                        <th style={{ padding: '1rem' }}>Institutional Email</th>
                        <th style={{ padding: '1rem' }}>Enrollment Date</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id} style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
                          <td style={{ padding: '1.5rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{student.full_name[0]}</div>
                              <span style={{ fontWeight: '600' }}>{student.full_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{student.email}</td>
                          <td style={{ padding: '1.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{new Date(student.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                            <button 
                              onClick={() => { setSelectedUser(student); setIsUserModalOpen(true); }}
                              style={{ background: 'transparent', border: '1px solid var(--sidebar-border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Faculty/Student Management Modal */}
      {isUserModalOpen && selectedUser && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-elevated fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>Account Management</h3>
              <X size={24} onClick={() => setIsUserModalOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', margin: '0 auto 1rem' }}>
                {selectedUser.full_name[0]}
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{selectedUser.full_name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedUser.role.toUpperCase()} • ID: {selectedUser.id.slice(0, 8)}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <Mail size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.875rem' }}>{selectedUser.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.875rem' }}>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '2.5rem' }}>
              <button style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Edit size={18} /> Edit Profile
              </button>
              <button style={{ padding: '0.875rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateCourseModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} onCreated={() => token && fetchData(token)} token={token || ''} />
    </div>
  );
}
