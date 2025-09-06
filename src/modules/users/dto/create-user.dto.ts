import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { IsEmailUnique, IsPhoneUnique, IsRoleExists } from '@api/core/validation';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'John',
    required: true,
    name: 'firstName',
    description: 'User first name',
  })
  @IsNotEmpty({ message: 'First name is required!' })
  @IsString({ message: 'Provide a valid first name as string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(60, { message: 'First name cannot exceed 60 characters' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'firstName' })
  public readonly firstName!: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
    required: true,
    name: 'lastName',
    description: 'User last name',
  })
  @IsNotEmpty({ message: 'Last name is required!' })
  @IsString({ message: 'Provide a valid last name as string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(60, { message: 'Last name cannot exceed 60 characters' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'lastName' })
  public readonly lastName!: string;

  @ApiProperty({ 
    type: String, 
    example: 'john@doe.com', 
    required: true,
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required!' })
  @IsString({ message: 'Provide a valid email as string' })
  @IsEmailUnique() // Uses Messages.User.Error.EMAIL_ALREADY_EXISTS automatically
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  @MaxLength(200, { message: 'Email cannot exceed 200 characters' })
  public readonly email!: string;

  @ApiProperty({
    type: String,
    example: '+1',
    required: true,
    name: 'countryCode',
    description: 'Country code (e.g., +1, +44, +91)',
  })
  @IsNotEmpty({ message: 'Country code is required!' })
  @IsString({ message: 'Country code must be a string' })
  @Matches(/^\+[1-9]\d{0,3}$/, { 
    message: 'Country code must be in format +X, +XX, +XXX, or +XXXX' 
  })
  @MaxLength(5, { message: 'Country code cannot exceed 5 characters' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'countryCode' })
  public readonly countryCode!: string;

  @ApiProperty({
    type: String,
    example: '9898232323',
    required: true,
    name: 'phoneNumber',
    description: 'Phone number without country code',
  })
  @IsNotEmpty({ message: 'Phone number is required!' })
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^[0-9]{7,14}$/, { 
    message: 'Phone number must contain only numeric digits (7-14 digits, no letters or special characters)' 
  })
  @IsPhoneUnique() // Uses Messages.User.Error.PHONE_NUMBER_ALREADY_EXISTS automatically
  @MaxLength(14, { message: 'Phone number cannot exceed 14 digits' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'phoneNumber' })
  public readonly phoneNumber!: string;

  @ApiProperty({ 
    type: String, 
    example: 'SecurePass123!', 
    required: true,
    description: 'User password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  public readonly password!: string;

  @ApiProperty({
    type: Number,
    description: 'The role ID to assign to the user',
    example: 1,
    required: true,
  })
  @IsInt({ message: 'Role ID must be an integer' })
  @IsNotEmpty({ message: 'Role ID is required!' })
  @IsRoleExists() // Uses Messages.Role.Error.IS_ROLE_NOT_FOUND automatically
  public readonly roleId!: number;

}
