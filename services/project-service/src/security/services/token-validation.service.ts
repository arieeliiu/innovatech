import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isUserActive } from '../utils/user-status.utils';

@Injectable()
export class TokenValidationService {
  private readonly supabase: SupabaseClient;

  constructor(configService: ConfigService) {
    this.supabase = createClient(
      configService.getOrThrow<string>('SUPABASE_URL'),
      configService.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );
  }

  async validate(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user || !isUserActive(data.user)) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name ?? data.user.email,
      role: data.user.user_metadata?.role ?? 'USER',
    };
  }
}
