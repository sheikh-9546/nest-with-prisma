import { ApiProperty } from '@nestjs/swagger';

export class UploadProfileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  readonly file: any;
}
