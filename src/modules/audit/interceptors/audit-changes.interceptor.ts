import { Injectable, NestInterceptor, ExecutionContext, CallHandler, NotFoundException } from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { PrismaService } from '@api/database/prisma.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditChangesInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
    private prisma: PrismaService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { params, user, method } = request;
    
    const auditConfig = this.reflector.get('audit', context.getHandler());
    if (!auditConfig) return next.handle();

    const { model, action } = auditConfig;
    const modelId = params.id;
    const startTime = Date.now();

    // Get current state if it's an update operation
    let oldData = null;
    if (modelId && ['PATCH', 'PUT', 'DELETE'].includes(method)) {
      oldData = await this.getModelData(model, modelId);
      if (!oldData) {
        throw new NotFoundException(`${model} not found`);
      }
    }

    // Handle the request and audit logging
    return next.handle().pipe(
      tap(async (data) => {
        if (!data) return;

        await this.auditService.log({
          userId: user?.id,
          action,
          model,
          modelId: data?.id || modelId,
          oldData,
          newData: this.sanitizeData(data),
          duration: Date.now() - startTime,
          metadata: {
            ip: request.ip,
            method,
            path: request.path,
            userAgent: request.get('user-agent'),
          }
        });
      })
    );
  }

  private async getModelData(model: string, id: string) {
    const modelName = model.toLowerCase();
    if (!this.prisma[modelName]) return null;
    
    try {
      return await this.prisma[modelName].findUnique({
        where: { id }
      });
    } catch (error) {
      return null;
    }
  }

  private sanitizeData(data: any) {
    if (!data) return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) sanitized[field] = '***';
    });
    
    return sanitized;
  }
} 