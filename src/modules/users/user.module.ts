import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from '@api/modules/users/user.controller';
import { PrismaModule } from '@api/database/prisma.module';
import { IsEmailUniqueConstraint } from '@api/core/validators/is-email-unique.validator';
import { PrismaService } from '@api/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { EmailService } from '../mailer/email.service';
import { UserValidationService } from './services/user.validation.service';
import { RolesService } from '../roles/services/role.service';

@Module({
  imports: [
    PrismaModule,
    RolesModule,
    forwardRef(() => UserModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    JwtService,
    IsEmailUniqueConstraint,
    UserValidationService,
    RolesService,
    EmailService,
  ],
  exports: [UserService],
})
export class UserModule {}

