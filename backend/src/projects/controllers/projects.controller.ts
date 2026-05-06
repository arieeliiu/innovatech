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
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import type { Request } from 'express';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectsService.findById(id);
  }

  @Delete(':id')
  deleteProject(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Post(':id/tasks')
  createTask(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.projectsService.createTask(id, createTaskDto);
  }

  @Get(':id/tasks')
  findTasksByProject(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectsService.findTasksByProject(id);
  }

  @Patch('tasks/:taskId/status')
  async updateTaskStatus(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
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
  finalizeProject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request,
    @Body() body: { comment?: string },
  ) {
    return this.projectsService.finalizeProject(id, request['user'].id, body?.comment);
  }

  @Get('tasks/:taskId')
  findTaskById(@Param('taskId', new ParseUUIDPipe()) taskId: string) {
    return this.projectsService.findTaskById(taskId);
  }

  @Post(':projectId/members')
  addProjectMember(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() addProjectMemberDto: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(projectId, addProjectMemberDto);
  }

  @Get('tasks/:taskId/history')
  async findTaskHistory(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ) {
    return this.projectsService.findTaskHistory(taskId);
  }

  @Get('tasks/:taskId/comments')
  async findTaskComments(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
  ) {
    return this.projectsService.findTaskComments(taskId);
  }

  @Post('tasks/:taskId/comments')
  async addTaskComment(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
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
  async findProjectMembers(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projectsService.findProjectMembers(id);
  }

  @Delete(':projectId/members/:userId')
  removeProjectMember(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.projectsService.removeProjectMember(projectId, userId);
  }
}