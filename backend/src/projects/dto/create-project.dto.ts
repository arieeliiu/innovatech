import { IsNotEmpty, IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate?: string;

  @IsUUID('4', {
    message: 'Formato incorrecto (UUID)',
  })
  @IsNotEmpty()
  managerId!: string;
}