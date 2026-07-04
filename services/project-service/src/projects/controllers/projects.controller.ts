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
import { AuthGuard } from '../../security/guards/auth.guard';
import { RolesGuard } from '../../security/guards/roles.guard';
import { Roles } from '../../security/decorators/roles.decorator';

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
    return this.projectsService.findAll(request.user.id, request.user.role);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.findById(
      id,
      request.user.id,
      request.user.role,
    );
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
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.createTask(
      id,
      createTaskDto,
      request.user.id,
      request.user.role,
    );
  }

  @Get(':id/tasks')
  findTasksByProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.findTasksByProject(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @Patch('tasks/:taskId/status')
  @Roles('ADMIN', 'MANAGER', 'ARCHITECT', 'DEVELOPER')
  updateTaskStatus(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.updateTaskStatus(
      taskId,
      updateTaskStatusDto,
      request.user.id,
      request.user.role,
    );
  }

  @Patch(':id/finalize')
  @Roles('ADMIN', 'MANAGER')
  finalizeProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: { comment?: string },
  ) {
    return this.projectsService.finalizeProject(
      id,
      request.user.id,
      body?.comment,
    );
  }

  @Get('tasks/:taskId')
  findTaskById(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.findTaskById(
      taskId,
      request.user.id,
      request.user.role,
    );
  }

  @Get('tasks/:taskId/history')
  findTaskHistory(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.findTaskHistory(
      taskId,
      request.user.id,
      request.user.role,
    );
  }

  @Get('tasks/:taskId/comments')
  findTaskComments(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.findTaskComments(
      taskId,
      request.user.id,
      request.user.role,
    );
  }

  @Post('tasks/:taskId/comments')
  addTaskComment(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createTaskCommentDto: CreateTaskCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.addTaskComment(
      taskId,
      request.user.id,
      request.user.role,
      createTaskCommentDto,
    );
  }

  @Post(':projectId/members')
  @Roles('ADMIN', 'MANAGER')
  addProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() addProjectMemberDto: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(
      projectId,
      addProjectMemberDto,
    );
  }

  @Get(':id/members')
  findProjectMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.projectsService.findProjectMembers(
      id,
      request.user.id,
      request.user.role,
    );
  }

  @Delete(':projectId/members/:userId')
  @Roles('ADMIN', 'MANAGER')
  removeProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeProjectMember(projectId, userId);
  }
}
