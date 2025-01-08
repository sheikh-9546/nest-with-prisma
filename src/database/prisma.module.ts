import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuditModule } from '@api/modules/audit/audit.module';

@Module({
  imports: [],
  providers: [PrismaService],
  exports: [PrismaService], //export this service to use in other modules
})
export class PrismaModule {}
