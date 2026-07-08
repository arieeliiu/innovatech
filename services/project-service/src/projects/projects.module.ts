import { Module } from '@nestjs/common';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';
import { SecurityModule } from '../security/security.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [SecurityModule, MailModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
