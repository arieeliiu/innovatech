import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  createClient,
  SupabaseClient,
  User,
  type AdminUserAttributes,
  type AuthError,
} from "@supabase/supabase-js";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { isUserActive } from "../auth/user-status";

@Injectable()
export class UsersService {
  private readonly supabase: SupabaseClient;
  private readonly authClient: SupabaseClient;

  constructor(configService: ConfigService) {
    this.supabase = createClient(
      configService.getOrThrow<string>("SUPABASE_URL"),
      configService.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY"),
    );
    this.authClient = createClient(
      configService.getOrThrow<string>("SUPABASE_URL"),
      configService.getOrThrow<string>("SUPABASE_ANON_KEY"),
    );
  }

  private formatUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.email ?? "Usuario sin nombre",
      role: user.user_metadata?.role ?? "Sin rol asignado",
      createdAt: user.created_at,
      active: isUserActive(user),
      deletedAt: user.app_metadata?.deleted_at ?? null,
    };
  }

  async create({ name, email, password, role }: CreateUserDto) {
    await this.ensureEmailAvailable(email);

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
      app_metadata: { is_active: true },
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
    const users: User[] = [];
    const perPage = 100;
    let page = 1;

    while (true) {
      const { data, error } = await this.supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) throw new InternalServerErrorException(error.message);

      users.push(...data.users);
      if (data.users.length < perPage) break;
      page += 1;
    }

    return {
      success: true,
      users: users.map((user) => this.formatUser(user)),
    };
  }

  async findById(id: string) {
    const user = await this.getUserOrThrow(id);
    return { success: true, user: this.formatUser(user) };
  }

  async updateRole(id: string, role: string) {
    const user = await this.getActiveUserOrThrow(id);
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

  async changePassword(
    id: string,
    currentPassword: string,
    password: string,
  ) {
    const user = await this.getActiveUserOrThrow(id);

    if (!user.email) {
      throw new UnauthorizedException("No se pudo verificar la cuenta");
    }

    const { error: verificationError } =
      await this.authClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (verificationError) {
      throw new UnauthorizedException("La contraseña actual no es correcta");
    }

    const { error } = await this.supabase.auth.admin.updateUserById(id, {
      password,
    });

    if (error) throw new InternalServerErrorException(error.message);

    return {
      success: true,
      message: "Contraseña actualizada correctamente",
    };
  }

  async update(id: string, body: UpdateUserDto) {
    const user = await this.getActiveUserOrThrow(id);
    const normalizedEmail = body.email?.trim().toLowerCase();
    const emailChanged =
      Boolean(normalizedEmail) && normalizedEmail !== user.email?.toLowerCase();
    const payload: AdminUserAttributes = {
      ...(emailChanged
        ? { email: normalizedEmail, email_confirm: true }
        : {}),
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

    if (emailChanged && normalizedEmail) {
      await this.ensureEmailAvailable(normalizedEmail, id);
    }

    const { data, error } = await this.supabase.auth.admin.updateUserById(
      id,
      payload,
    );

    if (error) this.throwUserUpdateError(error);

    return {
      success: true,
      message: "Usuario actualizado correctamente",
      user: this.formatUser(data.user),
    };
  }

  private throwUserUpdateError(error: AuthError): never {
    const message = error.message?.trim();
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes("already") ||
      normalizedMessage.includes("registered") ||
      normalizedMessage.includes("unique")
    ) {
      throw new BadRequestException("El correo ya está registrado");
    }

    if (
      normalizedMessage.includes("invalid") &&
      normalizedMessage.includes("email")
    ) {
      throw new BadRequestException("El correo ingresado no es válido");
    }

    throw new InternalServerErrorException(
      message && message !== "{}"
        ? message
        : "No se pudieron actualizar los datos del usuario",
    );
  }

  async remove(id: string, requestingUserId: string) {
    if (id === requestingUserId) {
      throw new BadRequestException("No puedes desactivar tu propia cuenta");
    }

    const user = await this.getUserOrThrow(id);
    const deletedAt = new Date().toISOString();
    const releasedEmail = this.getReleasedEmail(id);
    const { error } = await this.supabase.auth.admin.updateUserById(id, {
      email: releasedEmail,
      email_confirm: true,
      ban_duration: "876000h",
      app_metadata: {
        ...user.app_metadata,
        is_active: false,
        deleted_at: deletedAt,
        original_email: user.app_metadata?.original_email ?? user.email,
      },
    });

    if (error) throw new InternalServerErrorException(error.message);

    return {
      success: true,
      message: "Usuario desactivado correctamente",
      user: {
        ...this.formatUser(user),
        active: false,
        deletedAt,
      },
    };
  }

  private async getUserOrThrow(id: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);

    if (error || !data.user)
      throw new NotFoundException("Usuario no encontrado");
    return data.user;
  }

  private getReleasedEmail(userId: string) {
    return `disabled-${userId}@users.innovatech.cl`;
  }

  private async ensureEmailAvailable(email: string, excludedUserId?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.listAllAuthUsers();
    const owner = users.find(
      (user) =>
        user.id !== excludedUserId &&
        user.email?.trim().toLowerCase() === normalizedEmail,
    );

    if (!owner) return;

    if (isUserActive(owner)) {
      throw new BadRequestException("El correo ya está registrado");
    }

    const { error } = await this.supabase.auth.admin.updateUserById(owner.id, {
      email: this.getReleasedEmail(owner.id),
      email_confirm: true,
      app_metadata: {
        ...owner.app_metadata,
        original_email: owner.app_metadata?.original_email ?? owner.email,
      },
    });

    if (error) {
      throw new InternalServerErrorException(
        "No se pudo liberar el correo de la cuenta deshabilitada",
      );
    }
  }

  private async listAllAuthUsers() {
    const users: User[] = [];
    const perPage = 100;
    let page = 1;

    while (true) {
      const { data, error } = await this.supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) throw new InternalServerErrorException(error.message);

      users.push(...data.users);
      if (data.users.length < perPage) return users;
      page += 1;
    }
  }

  private async getActiveUserOrThrow(id: string) {
    const user = await this.getUserOrThrow(id);

    if (!isUserActive(user)) {
      throw new BadRequestException("El usuario está desactivado");
    }

    return user;
  }
}
