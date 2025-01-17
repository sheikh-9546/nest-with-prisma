import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AuditListener {
  @OnEvent('audit.log')
  async handleAuditLog(auditData: any) {
    // Process audit logs asynchronously
    // For example:
    // - Send to external logging service
    // - Generate notifications
    // - Trigger compliance workflows
    console.log('Audit log processed:', auditData);
  }
} 