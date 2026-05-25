import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    role: string;
  };
};

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.projectsService.findAll(
      request.user.id,
      request.user.role,
    );
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findById(id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Post(':id/tasks')
  @Roles('ADMIN', 'MANAGER', 'ARCHITECT', 'DEVELOPER')
  createTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.projectsService.createTask(id, createTaskDto);
  }

  @Get(':id/tasks')
  findTasksByProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findTasksByProject(id);
  }

  @Patch('tasks/:taskId/status')
  @Roles('ADMIN', 'MANAGER', 'ARCHITECT', 'DEVELOPER')
  async updateTaskStatus(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @Req() request: Request,
  ) {
    return this.projectsService.updateTaskStatus(
      taskId,
      updateTaskStatusDto,
      request['user'].id,
    );
  }

  @Patch(':id/finalize')
  @Roles('ADMIN', 'MANAGER')
  finalizeProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
    @Body() body: { comment?: string },
  ) {
    return this.projectsService.finalizeProject(
      id,
      request['user'].id,
      body?.comment,
    );
  }

  @Get('tasks/:taskId')
  findTaskById(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.projectsService.findTaskById(taskId);
  }

  @Post(':projectId/members')
  @Roles('ADMIN', 'MANAGER')
  addProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() addProjectMemberDto: AddProjectMemberDto,
    @Req() request: Request,
  ) {
    return this.projectsService.addProjectMember(
      projectId,
      addProjectMemberDto,
      request['user'].id,
    );
  }

  @Get('tasks/:taskId/history')
  async findTaskHistory(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.projectsService.findTaskHistory(taskId);
  }

  @Get('tasks/:taskId/comments')
  async findTaskComments(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.projectsService.findTaskComments(taskId);
  }

  @Post('tasks/:taskId/comments')
  async addTaskComment(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createTaskCommentDto: CreateTaskCommentDto,
    @Req() request: Request,
  ) {
    return this.projectsService.addTaskComment(
      taskId,
      request['user'].id,
      createTaskCommentDto,
    );
  }

  @Get(':id/members')
  async findProjectMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findProjectMembers(id);
  }

  @Delete(':projectId/members/:userId')
  @Roles('ADMIN', 'MANAGER')
  removeProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ) {
    return this.projectsService.removeProjectMember(
      projectId,
      userId,
      request['user'].id,
    );
  }
}