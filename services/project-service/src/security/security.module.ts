import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TokenValidationService } from './services/token-validation.service';

@Module({
  imports: [ConfigModule],
  providers: [TokenValidationService, AuthGuard, RolesGuard],
  exports: [TokenValidationService, AuthGuard, RolesGuard],
})
export class SecurityModule {}
