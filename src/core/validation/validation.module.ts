import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@api/database/prisma.module';
import { IsEmailUniqueConstraint } from '../validators/is-email-unique.validator';
import { IsPhoneUniqueConstraint } from '../validators/is-phone-unique.validator';
import { IsRoleExistsConstraint } from '../validators/is-role-exists.validator';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    IsEmailUniqueConstraint,
    IsPhoneUniqueConstraint,
    IsRoleExistsConstraint,
  ],
  exports: [
    IsEmailUniqueConstraint,
    IsPhoneUniqueConstraint,
    IsRoleExistsConstraint,
  ],
})
export class ValidationModule {}
