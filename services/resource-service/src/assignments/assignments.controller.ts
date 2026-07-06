import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ActiveUserGuard } from '../security/active-user.guard';

@Controller('assignments')
@UseGuards(ActiveUserGuard)
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

  @Patch(':assignmentId/deactivate')
  deactivate(
    @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
  ) {
    return this.assignmentsService.deactivate(assignmentId);
  }

}
