import { Controller, Post, Get, Body, UseGuards, Request, SetMetadata, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('courses')
@UseGuards(AuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('teacher', 'admin')
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    return this.coursesService.create(createCourseDto, req.user.id);
  }

  @Get('teacher')
  @Roles('teacher', 'admin')
  async findByTeacher(@Request() req: any) {
    return this.coursesService.findAllByTeacher(req.user.id);
  }

  @Get(':id/details')
  @Roles('teacher', 'admin', 'student')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOneWithDetails(id);
  }

  @Get()
  @SetMetadata('roles', ['student', 'teacher', 'admin'])
  async findAll() {
    return this.coursesService.findAll();
  }
}
