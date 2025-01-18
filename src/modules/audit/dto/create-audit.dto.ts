import { AuditAction } from '@api/enums/audit-action.enum';

export class CreateAuditDto {
  userId: string;
  action: AuditAction;
  model: string;
  modelId: string;
  duration: number;
  oldData?: any;
  newData?: any;
  metadata: {
    ip: string;
    method: string;
    path: string;
    userAgent: string;
  };
}
