import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto, teacherId: string) {
    // Verify course ownership
    const { data: course, error: courseError } = await this.supabaseService.getClient()
      .from('courses')
      .select('teacher_id')
      .eq('id', createAssignmentDto.course_id)
      .single();

    if (courseError || course.teacher_id !== teacherId) {
      throw new ForbiddenException('You do not own this course');
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('assignments')
      .insert([
        {
          ...createAssignmentDto,
          created_by: teacherId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // --- Institutional Notifications ---
    try {
      console.log('🏛️ Starting Institutional Broadcast for course:', createAssignmentDto.course_id);
      
      const { data: enrollments, error: enrollError } = await this.supabaseService.getClient()
        .from('course_enrollments')
        .select('student_id')
        .eq('course_id', createAssignmentDto.course_id);

      if (enrollError) {
        console.error('❌ Census Error (Enrollments):', enrollError.message);
      }

      console.log('👥 Students found for broadcast:', enrollments?.length || 0);

      if (enrollments && enrollments.length > 0) {
        const { data: courseData } = await this.supabaseService.getClient()
          .from('courses')
          .select('name')
          .eq('id', createAssignmentDto.course_id)
          .single();

        for (const enrollment of enrollments) {
          console.log('📡 Dispatching alert to student:', enrollment.student_id);
          this.notificationsService.create(
            enrollment.student_id,
            'New Assignment Posted',
            `A new assignment "${data.title}" has been posted in ${courseData?.name || 'your course'}.`,
            'assignment'
          ).then(() => console.log('✅ Alert Delivered to DB for:', enrollment.student_id))
           .catch(err => console.error('❌ Alert Delivery Failed for:', enrollment.student_id, err));
        }
      } else {
        console.warn('⚠️ No students enrolled in this course. Broadcast cancelled.');
      }
    } catch (notifErr) {
      console.error('🚨 Global Notification System Failure:', notifErr);
    }

    return data;
  }

  async findByCourse(courseId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('assignments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findAllForStudent(studentId: string) {
    // Get all courses student is enrolled in
    const { data: enrollments, error: enrollError } = await this.supabaseService.getClient()
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', studentId);

    if (enrollError) throw new InternalServerErrorException(enrollError.message);

    const courseIds = enrollments.map(e => e.course_id);

    const { data, error } = await this.supabaseService.getClient()
      .from('assignments')
      .select(`
        *,
        courses(name),
        submissions!left(id, grade, feedback, graded_at, file_url, file_name, submitted_at)
      `)
      .in('course_id', courseIds)
      .eq('submissions.student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }
}
