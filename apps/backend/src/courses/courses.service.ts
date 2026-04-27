import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createCourseDto: CreateCourseDto, creatorId: string) {
    const finalEnrollmentCode = createCourseDto.enrollment_code || Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalTeacherId = createCourseDto.teacher_id || creatorId;
    
    const { data, error } = await this.supabaseService.getClient()
      .from('courses')
      .insert([
        {
          name: createCourseDto.name,
          description: createCourseDto.description,
          teacher_id: finalTeacherId,
          enrollment_code: finalEnrollmentCode,
        },
      ])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOneWithDetails(courseId: string) {
    const client = this.supabaseService.getClient();
    
    // 1. Get Course and Teacher
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('*, teacher:users!teacher_id(*)')
      .eq('id', courseId)
      .single();

    if (courseError) throw new InternalServerErrorException(courseError.message);

    // 2. Get Students (Joining through course_enrollments to users)
    const { data: enrollments, error: enrollError } = await client
      .from('course_enrollments')
      .select('student:users(*)')
      .eq('course_id', courseId);

    // 3. Get Assignments and their submission counts
    const { data: assignments, error: assignError } = await client
      .from('assignments')
      .select('*, submissions(count)')
      .eq('course_id', courseId);

    return {
      ...course,
      students: enrollments?.map((e: any) => e.student) || [],
      assignments: assignments?.map((a: any) => ({
        ...a,
        submission_count: a.submissions?.[0]?.count || 0
      })) || []
    };
  }

  async findAllByTeacher(teacherId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.getClient()
      .from('courses')
      .select('*, teacher:users!teacher_id(full_name)');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
