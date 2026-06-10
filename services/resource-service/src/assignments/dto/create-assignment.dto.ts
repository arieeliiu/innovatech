import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsString()
  roleInProject?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}