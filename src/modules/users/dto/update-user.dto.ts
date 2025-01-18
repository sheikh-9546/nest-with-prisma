import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { Status } from '@api/enums/status.enum';

export class UpdateUserDto {
  @ApiProperty({ type: String, required: true, name: 'firstName' })
  @IsNotEmpty({ message: 'First name is required!' })
  @IsString({ message: 'Provide a valid first name as string' })
  @MaxLength(60)
  @Expose({ name: 'firstName' })
  @IsOptional()
  public readonly firstName!: string;

  @ApiProperty({ type: String, required: true, name: 'lastName' })
  @IsNotEmpty({ message: 'Last name is required!' })
  @IsString({ message: 'Provide a valid first name as string' })
  @MaxLength(60)
  @Expose({ name: 'lastName' })
  @IsOptional()
  public readonly lastName!: string;

  @ApiProperty({ type: String, required: true, name: 'phoneNumber' })
  @IsNumberString(
    {},
    { message: 'Phone number is required and must be a valid number' },
  )
  @MaxLength(15)
  @Expose({ name: 'phoneNumber' })
  @IsOptional()
  public readonly phoneNumber!: string;

  @IsNotEmpty()
  @IsEnum(Status)
  @IsOptional()
  status: Status;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  updatedBy?: number;
}
