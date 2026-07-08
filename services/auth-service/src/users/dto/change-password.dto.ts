import { IsString, MinLength } from "class-validator";
import { USER_PASSWORD_MIN_LENGTH } from "./user-validation.constants";

export class ChangePasswordDto {
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  currentPassword!: string;

  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  password!: string;
}
