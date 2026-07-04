import { IsIn, IsString } from "class-validator";
import { USER_ALLOWED_ROLES } from "./user-validation.constants";

export class UpdateRoleDto {
  @IsString()
  @IsIn([...USER_ALLOWED_ROLES])
  role!: string;
}
