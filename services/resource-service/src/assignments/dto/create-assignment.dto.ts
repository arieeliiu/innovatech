import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PROFESSIONAL_ROLES } from '../../common/resource-domain.utils';

export class CreateAssignmentDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsString()
  @IsIn(PROFESSIONAL_ROLES)
  roleInProject?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}