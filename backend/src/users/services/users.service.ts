import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );

  async findAll() {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const users = data.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.email ?? 'Usuario sin nombre',
      role: user.user_metadata?.role ?? 'Sin rol asignado',
      createdAt: user.created_at,
    }));

    return {
      success: true,
      users,
    };
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);

    if (error || !data.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name:
          data.user.user_metadata?.name ??
          data.user.email ??
          'Usuario sin nombre',
        role: data.user.user_metadata?.role ?? 'Sin rol asignado',
        createdAt: data.user.created_at,
      },
    };
  }
}