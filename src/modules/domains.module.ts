import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [UserModule, AuthModule, RolesModule, AuditModule],
})
export class DomainsModule {
}
