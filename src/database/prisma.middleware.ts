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

      // userId will be number type
      const userId: number = args?.data?.userId || 0; // 0 for system actions
      const modelId = args.where?.id || result.id;

      // Handle updates: find differences between old and new data
      if (action === 'update') {
        const before = await prismaService[model].findUnique({ where: args.where });
        const after = result;
        changes = diff(before, after);
      }

      // Convert numbers to strings before passing to audit service
      const userIdStr = userId.toString();
      const modelIdStr = modelId.toString();

      // Log activity based on the action
      if (action === 'create') {
        await auditService.logCreate(userIdStr, model, modelIdStr);
      } else if (action === 'update') {
        await auditService.logUpdate(userIdStr, model, modelIdStr, {
          before: params.args.data,
          after: result
        });
      } else if (action === 'delete') {
        await auditService.logDelete(userIdStr, model, modelIdStr);
      }
    }

    return result;
  };
}
