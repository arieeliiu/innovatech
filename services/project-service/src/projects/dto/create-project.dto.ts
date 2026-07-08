import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80, {
    message: 'El nombre del proyecto no puede superar los 80 caracteres',
  })
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
