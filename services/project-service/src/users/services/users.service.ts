import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );

  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.email ?? 'Usuario sin nombre',
      role: user.user_metadata?.role ?? 'Sin rol asignado',
      createdAt: user.created_at,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto;

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        throw new BadRequestException('El correo ya está registrado');
      }

      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Usuario creado correctamente',
      user: this.formatUser(data.user),
    };
  }

  async findAll() {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const users = data.users.map((user) => this.formatUser(user));

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
      user: this.formatUser(data.user),
    };
  }

  async updateRole(id: string, role: string) {
    const { data: userData, error: userError } =
      await this.supabase.auth.admin.getUserById(id);

    if (userError || !userData.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        ...userData.user.user_metadata,
        role,
      },
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Rol actualizado correctamente',
      user: this.formatUser(data.user),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { data: userData, error: userError } =
      await this.supabase.auth.admin.getUserById(id);

    if (userError || !userData.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const payload: {
      email?: string;
      password?: string;
      user_metadata?: {
        name?: string;
        role?: string;
      };
    } = {};

    if (updateUserDto.email) {
      payload.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      payload.password = updateUserDto.password;
    }

    if (updateUserDto.name || updateUserDto.role) {
      payload.user_metadata = {
        ...userData.user.user_metadata,
        ...(updateUserDto.name ? { name: updateUserDto.name } : {}),
        ...(updateUserDto.role ? { role: updateUserDto.role } : {}),
      };
    }

    if (!payload.email && !payload.password && !payload.user_metadata) {
      throw new BadRequestException('Debes enviar al menos un campo para editar');
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(
      id,
      payload,
    );

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Usuario actualizado correctamente',
      user: this.formatUser(data.user),
    };
  }

  async remove(id: string) {
    const { data: userData, error: userError } =
      await this.supabase.auth.admin.getUserById(id);

    if (userError || !userData.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { error } = await this.supabase.auth.admin.deleteUser(id);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Usuario eliminado correctamente',
    };
  }
}