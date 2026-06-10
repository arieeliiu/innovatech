import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsIn(['AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  weeklyHours?: number;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableTo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}