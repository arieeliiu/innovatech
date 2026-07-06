import { Global, Module } from '@nestjs/common';
import { ActiveUserGuard } from './active-user.guard';

@Global()
@Module({
  providers: [ActiveUserGuard],
  exports: [ActiveUserGuard],
})
export class SecurityModule {}
