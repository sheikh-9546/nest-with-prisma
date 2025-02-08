import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingSerializer {
  @Expose()
  id: number;

  @Expose()
  key: string;

  @Expose()
  value: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
} 