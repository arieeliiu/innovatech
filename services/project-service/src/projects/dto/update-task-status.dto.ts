import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['TODO', 'IN_PROGRESS', 'DONE'])
  status!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  progress!: number;

  @IsString()
  @IsOptional()
  comment?: string;

}