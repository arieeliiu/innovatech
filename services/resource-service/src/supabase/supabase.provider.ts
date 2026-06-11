import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

export const supabaseProvider: Provider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el archivo .env',
      );
    }

    return createClient(supabaseUrl, serviceRoleKey, {
      db: {
        schema: 'resource_service',
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  },
};