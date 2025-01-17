import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit.service';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Assuming you have user info in request
    const startTime = Date.now();
    const oldData = request.params?.id 
      ? this.getOldData(auditMetadata.model, request.params.id)
      : null;

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;
        
        const auditLog = {
          userId,
          action: auditMetadata.action,
          model: auditMetadata.model,
          modelId: response?.id || request.params?.id,
          duration,
          oldData: await oldData,
          newData: response,
          metadata: {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            method: request.method,
            path: request.path,
          }
        };

        await this.auditService.log(auditLog);
      }),
    );
  }

  private async getOldData(model: string, id: string) {
    // Implement logic to fetch old data if needed
    return null;
  }
} 