import { Module } from '@nestjs/common';
import { SettingController } from '@api/modules/settings/setting.controller';
import { SettingService } from '@api/modules/settings/setting.service';
import { PrismaService } from '@api/database/prisma.service';
import { AuditModule } from '@api/modules/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [SettingController],
  providers: [SettingService, PrismaService],
  exports: [SettingService],
})
export class SettingModule {}
