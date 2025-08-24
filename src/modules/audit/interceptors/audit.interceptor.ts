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
    const auditMetadata = this.reflector.get<AuditMetadata>(AUDIT_KEY, context.getHandler());
    if (!auditMetadata) return next.handle();

    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const oldData = await this.getOldData(auditMetadata.model, request);

    return next.handle().pipe(
      tap(async (result) => {
        if (!result) return;

        await this.auditService.log({
          userId: request.user?.id,
          action: auditMetadata.action,
          model: auditMetadata.model,
          modelId: String(result.id || request.params.id),
          duration: Date.now() - startTime,
          oldData,
          newData: this.sanitizeData(result),
          metadata: this.getRequestMetadata(request),
        });
      })
    );
  }

  private async getOldData(model: string, request: any): Promise<any> {
    if (!['PATCH', 'PUT', 'DELETE'].includes(request.method)) {
      return null;
    }

    const modelName = model.toLowerCase();
    const id = request.params.id;

    if (!this.prisma[modelName] || !id) return null;

    try {
      const data = await this.prisma[modelName].findUnique({ where: { id: parseInt(id) } });
      if (!data && request.method !== 'POST') {
        throw new NotFoundException(`${model} not found`);
      }
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      return null;
    }
  }

  private getRequestMetadata(request: any) {
    return {
      ip: request.ip,
      method: request.method,
      path: request.path,
      userAgent: request.get('user-agent'),
    };
  }

  private sanitizeData(data: any) {
    if (!data) return data;
    const sanitized = { ...data };
    ['password', 'token', 'secret'].forEach(field => {
      if (sanitized[field]) sanitized[field] = '***';
    });
    return sanitized;
  }
} 