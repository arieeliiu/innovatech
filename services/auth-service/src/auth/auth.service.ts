import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(configService: ConfigService) {
    this.supabase = createClient(
      configService.getOrThrow<string>("SUPABASE_URL"),
      configService.getOrThrow<string>("SUPABASE_ANON_KEY"),
    );
  }

  async validateToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name ?? data.user.email,
      role: data.user.user_metadata?.role ?? "USER",
    };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.status === 400 || error.status === 401) {
        throw new UnauthorizedException("Credenciales inválidas");
      }

      throw new ServiceUnavailableException(
        "No se pudo conectar con el servicio de autenticación",
      );
    }

    if (!data.session || !data.user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    return {
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? data.user.email,
        role: data.user.user_metadata?.role ?? "USER",
      },
    };
  }
}
