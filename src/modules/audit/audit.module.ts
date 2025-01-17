import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '@api/database/prisma.module';
import { PrismaService } from '@api/database/prisma.service';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    PrismaService,
    AuditService,
    AuditInterceptor,
  ],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
