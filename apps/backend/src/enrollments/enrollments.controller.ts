import { Controller, Post, Get, Body, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('enrollments')
@UseGuards(AuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @SetMetadata('roles', ['student'])
  async enroll(@Body() enrollDto: EnrollDto, @Request() req: any) {
    return this.enrollmentsService.enroll(enrollDto, req.user.id);
  }

  @Get('my')
  @SetMetadata('roles', ['student'])
  async getMyEnrollments(@Request() req: any) {
    return this.enrollmentsService.getMyEnrollments(req.user.id);
  }
}
