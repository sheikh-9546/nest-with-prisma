import { IsOptional, IsPositive, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDefaults, SortDirection } from '@api/enums/pagination.enum';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: PaginationDefaults.DEFAULT_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = PaginationDefaults.DEFAULT_PAGE;

  @ApiPropertyOptional({ description: 'Number of items per page', default: PaginationDefaults.DEFAULT_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number = PaginationDefaults.DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: 'Column to sort by', default: PaginationDefaults.DEFAULT_SORT_COLUMN })
  @IsOptional()
  @IsString()
  sort_column: string = PaginationDefaults.DEFAULT_SORT_COLUMN; 

  @ApiPropertyOptional({ description: 'Sort direction: asc or desc', default: PaginationDefaults.DEFAULT_SORT_DIRECTION })
  @IsOptional()
  @IsIn([SortDirection.ASC, SortDirection.DESC])
  sort_direction: string = PaginationDefaults.DEFAULT_SORT_DIRECTION;
}
