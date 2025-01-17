import { PrismaService } from '@api/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface AuditService {
  logCreate(userId: string, model: string, modelId: string): Promise<any>;
  logUpdate(userId: string, model: string, modelId: string, changes: any): Promise<any>;
  logDelete(userId: string, model: string, modelId: string): Promise<any>;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async log(auditData: {
    userId: string;
    action: string;
    model: string;
    modelId: string;
    duration?: number;
    oldData?: any;
    newData?: any;
    metadata?: any;
  }) {
    // Emit event for async processing
    this.eventEmitter.emit('audit.log', auditData);

    // Store in database with proper typing
    return this.prismaService.audit.create({
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
        metadata: auditData.metadata
      },
    });
  }

  async getAuditLogs(filters: {
    userId?: string;
    model?: string;
    action?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10, ...where } = filters;
    const skip = (page - 1) * limit;

    return this.prismaService.audit.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async logCreate(userId: string, model: string, modelId: string) {
    return this.log({
      userId,
      action: 'CREATE',
      model,
      modelId,
    });
  }

  async logUpdate(userId: string, model: string, modelId: string, changes: any) {
    return this.log({
      userId,
      action: 'UPDATE',
      model,
      modelId,
      oldData: changes.old,
      newData: changes.new,
    });
  }

  async logDelete(userId: string, model: string, modelId: string) {
    return this.log({
      userId,
      action: 'DELETE',
      model,
      modelId,
    });
  }
}
