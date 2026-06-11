import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('project/:projectId')
  findByProjectId(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.resourcesService.findByProjectId(projectId);
  }

  @Get(':userId')
  findByUserId(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.resourcesService.findByUserId(userId);
  }

  @Get()
  findAll() {
    return this.resourcesService.findAll();
  }
}
