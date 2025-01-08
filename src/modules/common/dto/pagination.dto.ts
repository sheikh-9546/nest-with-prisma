import { IsOptional, IsPositive, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Column to sort by', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sort_column: string = 'createdAt'; 

  @ApiPropertyOptional({ description: 'Sort direction: asc or desc', default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_direction: string = 'asc';
}
