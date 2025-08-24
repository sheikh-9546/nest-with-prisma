import { Expose } from "class-transformer";

export class UserSerializer {
  @Expose() id: number;

  @Expose() firstName: string;

  @Expose() lastName: string;

  @Expose()
  get full_name(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose() email: string;

  @Expose() phoneNumber: string;

  @Expose() stats: string;
  @Expose() createdAt?: Date;
  @Expose() createdBy?: number;
  @Expose() updatedAt?: Date;
  @Expose() updatedBy?: number;
  @Expose() deletedAt?: Date;
  @Expose() deletedBy?: number;
}
