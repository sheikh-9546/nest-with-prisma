import { Expose } from "class-transformer";

export class UserSerializer {
  @Expose() id: string;

  @Expose() firstName: string;

  @Expose() lastName: string;

  @Expose()
  get full_name(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose() email: string;

  @Expose() phoneNumber: string;

  @Expose() stats: string;
}
