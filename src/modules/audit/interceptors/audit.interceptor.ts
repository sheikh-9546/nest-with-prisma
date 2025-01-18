import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { PrismaService } from '@api/database/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
    private prisma: PrismaService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const auditMetadata = this.reflector.get<AuditMetadata>(AUDIT_KEY, context.getHandler());

    if (!auditMetadata) {
      return next.handle();
    }

    const startTime = Date.now();
    let oldData = null;

    if (['PATCH', 'PUT', 'DELETE'].includes(request.method)) {
      oldData = await this.getOldData(auditMetadata.model, request.params.id);
      if (!oldData) {
        throw new NotFoundException(`${auditMetadata.model} not found`);
      }
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (!data) return;
        
        const duration = Date.now() - startTime;
        await this.auditService.log({
          userId: request.user?.id,
          action: auditMetadata.action,
          model: auditMetadata.model,
          modelId: data?.id || request.params.id,
          duration,
          oldData,
          newData: this.sanitizeData(data),
          metadata: {
            ip: request.ip,
            method: request.method,
            path: request.path,
            userAgent: request.get('user-agent'),
          }
        });
      })
    );
  }

  private async getOldData(model: string, id: string) {
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