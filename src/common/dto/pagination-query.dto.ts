import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @Min(1)
  pageIndex: number;

  @IsInt()
  @Min(1)
  pageSize: number;
}
