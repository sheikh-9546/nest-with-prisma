import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { PrismaService } from '@api/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService, EventEmitter2],
  exports: [AuditService],
})
export class AuditModule {}
