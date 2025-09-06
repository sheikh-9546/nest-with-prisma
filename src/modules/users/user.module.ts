import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from '@api/modules/users/user.controller';
import { PrismaModule } from '@api/database/prisma.module';
// Custom validators are now registered globally in AppModule
import { PrismaService } from '@api/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { EmailService } from '../mailer/email.service';
import { UserValidationService } from './services/user.validation.service';
import { RolesService } from '../roles/services/role.service';
import { AuditModule } from '../audit/audit.module';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [
    PrismaModule,
    RolesModule,
    forwardRef(() => UserModule),
    AuditModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    JwtService,
    // Services
    UserValidationService,
    RolesService,
    EmailService,
    FileUploadService,
  ],
  exports: [UserService],
})
export class UserModule {}

