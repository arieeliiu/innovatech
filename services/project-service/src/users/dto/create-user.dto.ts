import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  USER_ALLOWED_ROLES,
  USER_PASSWORD_MIN_LENGTH,
} from './user-validation.constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([...USER_ALLOWED_ROLES])
  role!: string;
}