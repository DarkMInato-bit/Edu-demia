import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  SetMetadata, 
  Param, 
  Query,
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionsService } from './submissions.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('submissions')
@UseGuards(AuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':assignmentId')
  @SetMetadata('roles', ['student'])
  @UseInterceptors(FileInterceptor('file'))
  async submit(
    @Param('assignmentId') assignmentId: string,
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          // We can add FileTypeValidator here if needed, 
          // but we'll stick to a general approach for now
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.submissionsService.submit(assignmentId, req.user.id, file);
  }

  @Get('assignment/:assignmentId')
  @SetMetadata('roles', ['teacher'])
  async findByAssignment(@Param('assignmentId') assignmentId: string) {
    return this.submissionsService.findByAssignment(assignmentId);
  }

  @Get('download')
  @SetMetadata('roles', ['teacher', 'student'])
  async getDownloadUrl(@Query('fileUrl') fileUrl: string) {
    return { url: await this.submissionsService.getDownloadUrl(fileUrl) };
  }

  @Get('teacher')
  @SetMetadata('roles', ['teacher'])
  async findByTeacher(@Request() req: any) {
    return this.submissionsService.findAllByTeacher(req.user.id);
  }

  @Post(':id/grade')
  @SetMetadata('roles', ['teacher'])
  async grade(
    @Param('id') id: string,
    @Body() body: { grade: string; feedback: string }
  ) {
    return this.submissionsService.gradeSubmission(id, body.grade, body.feedback);
  }
}
