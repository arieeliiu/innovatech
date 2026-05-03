import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    // Cliente de Supabase usado para validar tokens JWT emitidos por Supabase Auth.
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_ANON_KEY')!,
    );
  }

  async validateToken(token: string) {
    // Método temporalmente usado para validar el JWT recibido desde el frontend.
    // Más adelante también podremos usar esta información para roles/permisos.
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }

  async login(email: string, password: string) {
  // Login real usando Supabase Auth.
  // Supabase valida las credenciales y devuelve una sesión con access_token JWT.
  const { data, error } = await this.supabase.auth.signInWithPassword({
    email,
    password,
    });

    if (error) {
      return {
        success: false,
        message: 'Credenciales inválidas',
        };
      }

    return {
    success: true,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      },
    };
  }

}