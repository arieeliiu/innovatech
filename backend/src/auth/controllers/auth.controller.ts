import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Endpoint para probar login desde Postman usando Supabase Auth.
    // Devuelve un access_token JWT que luego se usa en rutas protegidas.
    return this.authService.login(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() request: Request) {
    // Ruta protegida de prueba.
    // Solo responde si el token JWT de Supabase es válido.
    return {
      success: true,
      message: 'Acceso autorizado',
      user: request['user'],
    };
  }

}// Fin del archivo AuthController