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
  const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name ?? data.user.email,
      role: data.user.user_metadata?.role ?? 'USER',
      };
  }

  async login(email: string, password: string) {
  const { data, error } = await this.supabase.auth.signInWithPassword({
    email,
    password,
    });

    if (error || !data.session || !data.user) {
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
        name: data.user.user_metadata?.name ?? data.user.email,
        role: data.user.user_metadata?.role ?? 'USER',
      },
    };
  }

}