import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsUUID()
  userId!: string;

  @IsIn(['AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE'])
  status!: string;

  @IsInt()
  @Min(0)
  @Max(60)
  weeklyHours!: number;

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