import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token no enviado o inválido');
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    const isActive =
      data.user?.app_metadata?.is_active !== false &&
      !data.user?.app_metadata?.deleted_at;

    if (error || !data.user || !isActive) {
      throw new UnauthorizedException('Sesión inválida o cuenta desactivada');
    }

    request.user = data.user;
    return true;
  }
}
