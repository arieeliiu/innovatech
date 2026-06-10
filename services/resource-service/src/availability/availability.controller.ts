import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  create(@Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilityService.create(createAvailabilityDto);
  }

  @Get()
  findAll() {
    return this.availabilityService.findAll();
  }

  @Get(':userId')
  findByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.availabilityService.findByUserId(userId);
  }

  @Patch(':userId')
  updateByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateByUserId(
      userId,
      updateAvailabilityDto,
    );
  }
}