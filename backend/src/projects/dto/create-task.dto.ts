import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  responsibleId!: string;

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsOptional()
  endDate!: string;
}