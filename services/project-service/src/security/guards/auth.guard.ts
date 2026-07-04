import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenValidationService } from '../services/token-validation.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenValidation: TokenValidationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no enviado');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const user = await this.tokenValidation.validate(token);

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    request.user = user;
    return true;
  }
}
