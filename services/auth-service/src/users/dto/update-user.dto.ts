import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import {
  USER_ALLOWED_ROLES,
  USER_NAME_MIN_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from "./user-validation.constants";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(USER_NAME_MIN_LENGTH)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsIn([...USER_ALLOWED_ROLES])
  role?: string;

  @IsOptional()
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  password?: string;
}
