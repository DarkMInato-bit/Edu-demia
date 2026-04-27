export class CreateAssignmentDto {
  course_id: string;
  title: string;
  description: string;
  deadline: string; // ISO Date string
  allowed_types?: string[];
  reference_file_url?: string;
}
