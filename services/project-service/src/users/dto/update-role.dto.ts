import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { USER_ALLOWED_ROLES } from './user-validation.constants';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([...USER_ALLOWED_ROLES])
  role!: string;
}
