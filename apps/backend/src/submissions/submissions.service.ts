import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SubmissionsService {
  constructor(private supabaseService: SupabaseService) { }

  async submit(assignmentId: string, studentId: string, file: Express.Multer.File) {
    // 1. Get Assignment to check deadline
    const { data: assignment, error: assignError } = await this.supabaseService.getClient()
      .from('assignments')
      .select('deadline')
      .eq('id', assignmentId)
      .single();

    if (assignError) throw new BadRequestException('Assignment not found');

    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isLate = now > deadline;

    // 2. Upload to Supabase Storage
    // Path: assignments/{assignmentId}/{studentId}/{filename}
    const filePath = `${assignmentId}/${studentId}/${file.originalname}`;
    const { data: uploadData, error: uploadError } = await this.supabaseService.getClient()
      .storage
      .from('Submission')
      .upload(filePath, file.buffer, {
        upsert: true,
        contentType: file.mimetype,
      });

    if (uploadError) throw new InternalServerErrorException(uploadError.message);

    // 3. Record in Database
    const { data, error } = await this.supabaseService.getClient()
      .from('submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        file_url: uploadData.path,
        file_name: file.originalname,
        submitted_at: now.toISOString(),
        is_late: isLate,
      }, { onConflict: 'assignment_id,student_id' })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }

  async findByAssignment(assignmentId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('submissions')
      .select('*, student:users(full_name, email)')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }

  async getDownloadUrl(fileUrl: string) {
    console.log('🏛️ Institutional Download Request:', fileUrl);
    
    const { data, error } = await this.supabaseService.getClient()
      .storage
      .from('Submission')
      .createSignedUrl(fileUrl, 60); // 60 seconds expiry

    if (error) {
      console.error('❌ Cloud Storage Error:', error.message);
      throw new InternalServerErrorException(error.message);
    }

    return data.signedUrl;
  }

  async findAllByTeacher(teacherId: string) {
    const client = this.supabaseService.getClient();
    
    // 1. Get courses for this teacher
    const { data: courses } = await client
      .from('courses')
      .select('id')
      .eq('teacher_id', teacherId);

    if (!courses?.length) return [];
    const courseIds = courses.map(c => c.id);

    // 2. Get assignments for these courses
    const { data: assignments } = await client
      .from('assignments')
      .select('id')
      .in('course_id', courseIds);

    if (!assignments?.length) return [];
    const assignmentIds = assignments.map(a => a.id);

    // 3. Get all submissions
    const { data, error } = await client
      .from('submissions')
      .select(`
        *,
        student:users!student_id(full_name, email),
        assignment:assignments(title, course_id, courses(name))
      `)
      .in('assignment_id', assignmentIds)
      .order('submitted_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async gradeSubmission(submissionId: string, grade: string, feedback: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('submissions')
      .update({
        grade,
        feedback,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
