import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: string;
  model: string;
}

export const Audit = (metadata: AuditMetadata) => SetMetadata(AUDIT_KEY, metadata); 