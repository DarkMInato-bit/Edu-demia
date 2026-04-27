/**
 * 🏛️ Institutional Shared Types
 * These models are the source of truth for the entire Glacier EDU ecosystem.
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  enrollment_code: string;
  teacher_id?: string;
  teacher?: Partial<Profile>;
  created_at: string;
  student_count?: number;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  deadline: string;
  created_at: string;
  courses?: {
    name: string;
  };
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedback?: string;
  graded_at?: string;
  created_at: string;
  student?: Partial<Profile>;
}
