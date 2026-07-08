import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) return true;

    const role = context
      .switchToHttp()
      .getRequest()
      .user?.role?.trim()
      .toUpperCase();

    if (!roles.includes(role)) {
      throw new ForbiddenException(
        "No tienes permisos para realizar esta acción",
      );
    }

    return true;
  }
}
