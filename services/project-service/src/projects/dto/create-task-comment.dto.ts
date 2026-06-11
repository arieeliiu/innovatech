import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;
}