import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { toLower } from 'lodash';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'John',
    required: true,
    name: 'firstName',
  })
  @IsNotEmpty({ message: 'First name is required!' })
  @IsString({ message: 'Provide a valid first name as string' })
  @MaxLength(60)
  @Expose({ name: 'firstName' })
  public readonly firstName!: string;

  @ApiProperty({
    type: String,
    example: 'doe',
    required: true,
    name: 'lastName',
  })
  @IsNotEmpty({ message: 'Last name is required!' })
  @IsString({ message: 'Provide a valid first name as string' })
  @MaxLength(60)
  @Expose({ name: 'lastName' })
  public readonly lastName!: string;

  @ApiProperty({ type: String, example: 'john@doe.com', required: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required!' })
  @IsString({ message: 'Provide a valid email as sting' })
  @Transform(({ value }) => value && toLower(value))
  @MaxLength(200)
  public readonly email!: string;

  @ApiProperty({
    type: String,
    example: '+19898232323',
    required: true,
    name: 'phoneNumber',
  })
  @IsNumberString(
    {},
    { message: 'Phone number is required and must be a valid number' },
  )
  @MaxLength(15)
  @Expose({ name: 'phoneNumber' })
  public readonly phoneNumber!: string;

  @ApiProperty({ type: String, example: 'Test@123', required: true })
  @IsString()
  @IsNotEmpty()
  public password: string;

  @ApiProperty({
    description: 'The role ID to assign to the user',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

}
