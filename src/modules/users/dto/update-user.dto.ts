import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { Status } from '@api/enums/status.enum';

export class UpdateUserDto {
  @ApiProperty({ 
    type: String, 
    required: false, 
    name: 'firstName',
    description: 'User first name',
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'Provide a valid first name as string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(60, { message: 'First name cannot exceed 60 characters' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'firstName' })
  public readonly firstName?: string;

  @ApiProperty({ 
    type: String, 
    required: false, 
    name: 'lastName',
    description: 'User last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString({ message: 'Provide a valid last name as string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(60, { message: 'Last name cannot exceed 60 characters' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'lastName' })
  public readonly lastName?: string;

  @ApiProperty({
    type: String,
    required: false,
    name: 'countryCode',
    description: 'Country code (e.g., +1, +44, +91)',
    example: '+1',
  })
  @IsOptional()
  @IsString({ message: 'Country code must be a string' })
  @Matches(/^\+[1-9]\d{0,3}$/, { 
    message: 'Country code must be in format +X, +XX, +XXX, or +XXXX' 
  })
  @MaxLength(5, { message: 'Country code cannot exceed 5 characters' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'countryCode' })
  public readonly countryCode?: string;

  @ApiProperty({
    type: String,
    required: false,
    name: 'phoneNumber',
    description: 'Phone number without country code',
    example: '9898232323',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^[0-9]{7,14}$/, { 
    message: 'Phone number must be 7-14 digits without country code' 
  })
  @MaxLength(14, { message: 'Phone number cannot exceed 14 digits' })
  @Transform(({ value }) => value?.trim())
  @Expose({ name: 'phoneNumber' })
  public readonly phoneNumber?: string;

  @ApiProperty({
    enum: Status,
    required: false,
    description: 'User status',
    example: Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  public readonly status?: Status;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  updatedBy?: number;
}
