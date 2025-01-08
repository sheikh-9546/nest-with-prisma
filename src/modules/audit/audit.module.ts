import { Module } from '@nestjs/common';
import { PrismaModule } from '@api/database/prisma.module';
import { PrismaService } from '@api/database/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService],
  exports: [],
})
export class AuditModule { }
