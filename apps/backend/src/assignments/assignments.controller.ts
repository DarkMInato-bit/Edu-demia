import { Controller, Post, Get, Body, UseGuards, Request, SetMetadata, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('assignments')
@UseGuards(AuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @SetMetadata('roles', ['teacher'])
  async create(@Body() createAssignmentDto: CreateAssignmentDto, @Request() req: any) {
    return this.assignmentsService.create(createAssignmentDto, req.user.id);
  }

  @Get('course/:courseId')
  @SetMetadata('roles', ['student', 'teacher'])
  async findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(courseId);
  }

  @Get('student')
  @SetMetadata('roles', ['student'])
  async findAllForStudent(@Request() req: any) {
    return this.assignmentsService.findAllForStudent(req.user.id);
  }
}
