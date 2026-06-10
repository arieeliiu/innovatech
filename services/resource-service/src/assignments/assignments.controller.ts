import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Post()
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get('user/:userId')
  findByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.assignmentsService.findByUserId(userId);
  }

  @Get('user/:userId/workload')
  getWorkload(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.assignmentsService.getWorkload(userId);
  }
}