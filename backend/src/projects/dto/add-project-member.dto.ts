import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddProjectMemberDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['MANAGER', 'DEVELOPER', 'ARCHITECT', 'CONSULTANT'])
  projectRole!: string;
}