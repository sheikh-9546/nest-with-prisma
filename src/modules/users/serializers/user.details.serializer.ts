import { Expose } from 'class-transformer';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UserDetailsSerializer {
  @Expose()
  @IsString()
  firstName: string;
  @Expose()
  @IsString()
  userId: string;
  @Expose()
  @IsString()
  lastName: string;
  @Expose()
  @IsString()
  countryCode: string;
  @Expose()
  @IsString()
  phoneNumber: string;
  @Expose()
  get fullPhoneNumber(): string {
    return `${this.countryCode}${this.phoneNumber}`;
  }
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
