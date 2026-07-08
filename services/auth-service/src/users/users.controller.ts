import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("ADMIN")
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch("me/password")
  changeOwnPassword(
    @Req() request: Request & { user: { id: string } },
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      request.user.id,
      body.currentPassword,
      body.password,
    );
  }

  @Patch(":id/role")
  @Roles("ADMIN")
  updateRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, body.role);
  }

  @Patch(":id")
  @Roles("ADMIN")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.usersService.remove(id, request.user.id);
  }
}
