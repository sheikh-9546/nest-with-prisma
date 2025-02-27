import { Injectable } from '@nestjs/common';
import { PrismaService } from '@api/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateAuditDto } from './dto/create-audit.dto';
import { AuditAction } from '@api/enums/audit-action.enum';

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async log(auditData: CreateAuditDto): Promise<void> {
    try {
      // Emit event for async processing
      this.eventEmitter.emit('audit.log', auditData);

      // Store in database
      await this.prisma.audit.create({
        data: {
          userId: auditData.userId,
          action: auditData.action,
          model: auditData.model,
          modelId: auditData.modelId,
          changes: {
            old: auditData.oldData,
            new: auditData.newData,
          },
          duration: auditData.duration,
          metadata: auditData.metadata,
        },
      });
    } catch (error) {
      // Log error but don't throw to prevent affecting main operation
      console.error('Audit logging failed:', error);
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    model?: string;
    modelId?: string;
    action?: AuditAction;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10, ...where } = filters;
    return this.prisma.audit.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async logCreate(userId: string, model: string, modelId: string, metadata?: Partial<AuditMetadata>): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.CREATE,
      model,
      modelId,
      duration: 0,
      metadata: {
        ip: metadata?.ip || 'database-operation',
        method: metadata?.method || 'CREATE',
        path: metadata?.path || `prisma/${model.toLowerCase()}`,
        userAgent: metadata?.userAgent || 'prisma-middleware',
      },
    });
  }

  async logUpdate(
    userId: string, 
    model: string, 
    modelId: string, 
    changes: { before: any; after: any },
    metadata?: Partial<AuditMetadata>
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.UPDATE,
      model,
      modelId,
      oldData: changes.before,
      newData: changes.after,
      duration: 0,
      metadata: {
        ip: metadata?.ip || 'database-operation',
        method: metadata?.method || 'UPDATE',
        path: metadata?.path || `prisma/${model.toLowerCase()}`,
        userAgent: metadata?.userAgent || 'prisma-middleware',
      },
    });
  }

  async logDelete(userId: string, model: string, modelId: string, metadata?: Partial<AuditMetadata>): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.DELETE,
      model,
      modelId,
      duration: 0,
      metadata: {
        ip: metadata?.ip || 'database-operation',
        method: metadata?.method || 'DELETE',
        path: metadata?.path || `prisma/${model.toLowerCase()}`,
        userAgent: metadata?.userAgent || 'prisma-middleware',
      },
    });
  }
}

interface AuditMetadata {
  ip: string;
  method: string;
  path: string;
  userAgent: string;
}
