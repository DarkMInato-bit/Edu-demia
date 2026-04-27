import { Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EnrollDto } from './dto/enroll.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private supabaseService: SupabaseService) {}

  async enroll(enrollDto: EnrollDto, studentId: string) {
    // 1. Find course by code
    const { data: course, error: findError } = await this.supabaseService.getClient()
      .from('courses')
      .select('id')
      .eq('enrollment_code', enrollDto.enrollment_code)
      .single();

    if (findError || !course) {
      throw new NotFoundException('Invalid enrollment code');
    }

    // 2. Check if already enrolled
    const { data: existing, error: checkError } = await this.supabaseService.getClient()
      .from('course_enrollments')
      .select('id')
      .eq('course_id', course.id)
      .eq('student_id', studentId)
      .single();

    if (existing) {
      throw new ConflictException('You are already enrolled in this course');
    }

    // 3. Enroll
    const { data, error } = await this.supabaseService.getClient()
      .from('course_enrollments')
      .insert([
        {
          course_id: course.id,
          student_id: studentId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async getMyEnrollments(studentId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('course_enrollments')
      .select('*, courses(*, teacher:users(full_name))')
      .eq('student_id', studentId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
