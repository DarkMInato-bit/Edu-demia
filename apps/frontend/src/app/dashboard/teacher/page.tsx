'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { CourseList } from '@/components/dashboard/CourseList';
import { CreateCourseModal } from '@/components/dashboard/CreateCourseModal';
import { CreateAssignmentModal } from '@/components/dashboard/CreateAssignmentModal';
import { AssignmentsByCourseModal } from '@/components/dashboard/AssignmentsByCourseModal';
import { SubmissionsModal } from '@/components/dashboard/SubmissionsModal';
import { supabase } from '@/lib/supabase';
import { Plus, Users, BookOpen, ClipboardList, TrendingUp, Clock } from 'lucide-react';

const FacultyStatCard = ({ label, value, icon, accent }: { label: string, value: string | number, icon: React.ReactNode, accent: string }) => (
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

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/teacher`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.ok) {
        setCourses(await response.json());
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = user?.user_metadata?.is_approved !== false; // Default to true if not present for existing users

  if (!isApproved) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
          <TopBar title="Account Verification" />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <div className="glass-elevated" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '600px' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(245, 158, 11, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' 
              }}>
                <Clock size={40} style={{ color: '#f59e0b' }} />
              </div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>Verification in Progress</h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Welcome, Prof. {user?.user_metadata?.full_name?.split(' ').pop()}. Your faculty account is currently being reviewed by the administration. 
              </p>
              <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--sidebar-border)', textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem' }}>Next Steps:</p>
                <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                  <li>Admin verifies your institutional credentials.</li>
                  <li>Account status is updated to 'Approved'.</li>
                  <li>You gain full access to post assignments and manage courses.</li>
                </ul>
              </div>
              <button 
                onClick={signOut}
                style={{ marginTop: '2.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}
              >
                Sign out and check back later
              </button>
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
        <TopBar title="Faculty Portal" />
        
        <main style={{ padding: '2.5rem' }}>
          {/* Faculty Header */}
          <section className="fade-in" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, rgba(59, 111, 212, 0.05), transparent)',
            padding: '2.5rem',
            borderRadius: '24px',
            border: '1px solid var(--sidebar-border)'
          }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
                Welcome back, Prof. {user?.user_metadata?.full_name?.split(' ').pop() || 'Instructor'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                You have <strong>{courses.length}</strong> active courses and 12 submissions awaiting review today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsAssignModalOpen(true)}
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
                <Plus size={20} /> Post Assignment
              </button>
            </div>
          </section>

          {/* Faculty Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
            <FacultyStatCard label="Active Courses" value={courses.length} icon={<BookOpen size={24} />} accent="#3b6fd4" />
            <FacultyStatCard label="Total Students" value={48} icon={<Users size={24} />} accent="#8b5cf6" />
            <FacultyStatCard label="Submissions" value={124} icon={<ClipboardList size={24} />} accent="#10b981" />
            <FacultyStatCard label="Avg. Grade" value="84%" icon={<TrendingUp size={24} />} accent="#f59e0b" />
          </div>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Your Course Catalog</h2>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Managed Courses</span>
            </div>
            
            <CourseList 
              courses={courses} 
              loading={loading} 
              onViewAssignments={(courseId) => {
                const course = courses.find(c => c.id === courseId);
                setSelectedCourse(course);
              }}
            />
          </section>
        </main>
      </div>

      {/* Modals */}
      <CreateCourseModal 
        isOpen={isCourseModalOpen} 
        onClose={() => setIsCourseModalOpen(false)} 
        onCreated={() => token && fetchCourses(token)}
        token={token || ''}
      />

      <CreateAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onCreated={() => {}}
        courses={courses}
        token={token || ''}
      />

      <AssignmentsByCourseModal 
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        courseId={selectedCourse?.id}
        courseName={selectedCourse?.name}
        token={token || ''}
        onViewSubmissions={(assignment) => {
          setSelectedAssignment(assignment);
        }}
      />

      <SubmissionsModal 
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        assignmentId={selectedAssignment?.id}
        assignmentTitle={selectedAssignment?.title}
        token={token || ''}
      />
    </div>
  );
}
