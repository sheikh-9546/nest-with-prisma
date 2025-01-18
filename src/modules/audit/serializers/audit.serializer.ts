export class AuditSerializer {
  id: string;
  action: string;
  model: string;
  userId: string;
  details: any;
  createdAt: Date;
  updatedAt: Date;
} 