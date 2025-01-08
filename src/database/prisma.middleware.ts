import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { AuditService } from '@api/modules/audit/audit.service';
import { diff } from '@api/utils/diff';

export function auditMiddleware(auditService: AuditService, prismaService: PrismaService): Prisma.Middleware {  
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const result = await next(params);

    const { action, model, args } = params;

    // Log only for create, update, and delete actions
    if (['create', 'update', 'delete'].includes(action)) {
      let changes = {};

      const userId = args?.data?.userId || 'system'; // Replace 'system' with actual authenticated userId
      const modelId = args.where?.id || result.id;

      // Handle updates: find differences between old and new data
      if (action === 'update') {
        // Use `prismaService` instead of `prisma`
        const before = await prismaService[model].findUnique({ where: args.where });
        const after = result;
        changes = diff(before, after);
      }

      // Log activity based on the action
      if (action === 'create') {
        await auditService.logCreate(userId, model, modelId);
      } else if (action === 'update') {
        await auditService.logUpdate(userId, model, modelId, changes);
      } else if (action === 'delete') {
        await auditService.logDelete(userId, model, modelId);
      }
    }

    return result;
  };
}
