import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsString()
  roleInProject?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  allocationPercentage!: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}