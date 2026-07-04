import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";
import {
  USER_ALLOWED_ROLES,
  USER_PASSWORD_MIN_LENGTH,
} from "./user-validation.constants";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  password!: string;

  @IsString()
  @IsIn([...USER_ALLOWED_ROLES])
  role!: string;
}
