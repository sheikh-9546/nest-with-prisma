import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../../../enums/audit-action.enum';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: AuditAction;
  model: string;
}

export const Audit = (metadata: AuditMetadata) => SetMetadata(AUDIT_KEY, metadata); 