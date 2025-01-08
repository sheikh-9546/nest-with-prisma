import {
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Status } from '@api/enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'The status of the user',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

}
