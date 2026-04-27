import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private supabaseService: SupabaseService) {}

  async listUsers() {
    // Fetch directly from the public.users table as shown in the screenshot
    const { data, error } = await this.supabaseService.getClient()
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database Fetch Error:', error);
      throw new InternalServerErrorException(error.message);
    }
    
    console.log(`AdminService: Fetched ${data.length} users from public.users table.`);
    
    // Map to the format expected by the frontend
    return data.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name || 'Unknown',
      role: u.role || 'student',
      is_approved: u.is_approved !== false, // Assuming is_approved column exists or defaulting
      created_at: u.created_at,
    }));
  }

  async approveTeacher(userId: string) {
    // 1. Update the public.users table
    const { error: dbError } = await this.supabaseService.getClient()
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (dbError) throw new InternalServerErrorException(dbError.message);

    // 2. Also update Auth metadata for consistency
    const { data: { user } } = await this.supabaseService.getAdminClient().auth.admin.getUserById(userId);
    if (user) {
      await this.supabaseService.getAdminClient().auth.admin.updateUserById(
        userId,
        { user_metadata: { ...user.user_metadata, is_approved: true } }
      );
    }

    return { message: 'Teacher approved successfully' };
  }

  async listCourses() {
    // Fetch courses along with their enrollment counts and teacher names
    const { data, error } = await this.supabaseService.getClient()
      .from('courses')
      .select(`
        *,
        teacher:users!teacher_id(full_name),
        student_count:course_enrollments(count)
      `);

    if (error) throw new InternalServerErrorException(error.message);
    
    return data.map(course => ({
      ...course,
      student_count: course.student_count?.[0]?.count || 0,
      teacher_name: course.teacher?.full_name || 'Unassigned'
    }));
  }
}
