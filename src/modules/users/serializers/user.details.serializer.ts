import { Expose } from 'class-transformer';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UserDetailsSerializer {
  @Expose()
  @IsString()
  firstName: string;

  @Expose()
  @IsString()
  lastName: string;

  @Expose()
  @IsString()
  phoneNumber: string;

  @Expose()
  get full_name(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  status: string;

  @Expose()
  @IsOptional()
  @IsString()
  role: string;
}
