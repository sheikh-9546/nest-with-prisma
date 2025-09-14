import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { SettingModule } from './settings/setting.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [UserModule, AuthModule, RolesModule, AuditModule, SettingModule, StatsModule],
})
export class DomainsModule {
}
