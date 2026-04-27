import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers() {
    return this.adminService.listUsers();
  }

  @Post('approve/:id')
  async approveTeacher(@Param('id') id: string) {
    return this.adminService.approveTeacher(id);
  }

  @Get('courses')
  async getCourses() {
    return this.adminService.listCourses();
  }
}
