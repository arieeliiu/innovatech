import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  private readonly supabase: SupabaseClient;

  constructor(configService: ConfigService) {
    this.supabase = createClient(
      configService.getOrThrow<string>("SUPABASE_URL"),
      configService.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY"),
    );
  }

  private formatUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.email ?? "Usuario sin nombre",
      role: user.user_metadata?.role ?? "Sin rol asignado",
      createdAt: user.created_at,
    };
  }

  async create({ name, email, password, role }: CreateUserDto) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        throw new BadRequestException("El correo ya está registrado");
      }
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: "Usuario creado correctamente",
      user: this.formatUser(data.user),
    };
  }

  async findAll() {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error) throw new InternalServerErrorException(error.message);

    return {
      success: true,
      users: data.users.map((user) => this.formatUser(user)),
    };
  }

  async findById(id: string) {
    const user = await this.getUserOrThrow(id);
    return { success: true, user: this.formatUser(user) };
  }

  async updateRole(id: string, role: string) {
    const user = await this.getUserOrThrow(id);
    const { data, error } = await this.supabase.auth.admin.updateUserById(id, {
      user_metadata: { ...user.user_metadata, role },
    });

    if (error) throw new InternalServerErrorException(error.message);

    return {
      success: true,
      message: "Rol actualizado correctamente",
      user: this.formatUser(data.user),
    };
  }

  async update(id: string, body: UpdateUserDto) {
    const user = await this.getUserOrThrow(id);
    const payload = {
      ...(body.email ? { email: body.email } : {}),
      ...(body.password ? { password: body.password } : {}),
      ...(body.name || body.role
        ? {
            user_metadata: {
              ...user.user_metadata,
              ...(body.name ? { name: body.name } : {}),
              ...(body.role ? { role: body.role } : {}),
            },
          }
        : {}),
    };

    if (!Object.keys(payload).length) {
      throw new BadRequestException(
        "Debes enviar al menos un campo para editar",
      );
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(
      id,
      payload,
    );

    if (error) throw new InternalServerErrorException(error.message);

    return {
      success: true,
      message: "Usuario actualizado correctamente",
      user: this.formatUser(data.user),
    };
  }

  async remove(id: string) {
    await this.getUserOrThrow(id);
    const { error } = await this.supabase.auth.admin.deleteUser(id);

    if (error) throw new InternalServerErrorException(error.message);

    return { success: true, message: "Usuario eliminado correctamente" };
  }

  private async getUserOrThrow(id: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);

    if (error || !data.user)
      throw new NotFoundException("Usuario no encontrado");
    return data.user;
  }
}
