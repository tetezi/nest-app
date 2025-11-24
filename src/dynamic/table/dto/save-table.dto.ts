import {
  DynamicColType,
  SubTableQueryStrategy,
  SubTableType,
  SubTableWritableStrategy,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class SaveTableColDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  canWritable?: boolean;

  @IsOptional()
  @IsBoolean()
  canQuery?: boolean;

  @IsEnum(DynamicColType)
  colType: DynamicColType;

  @IsOptional()
  @Type(() => Object)
  @IsArray()
  fission?: object[];

  @IsString()
  @IsOptional()
  transform?: string;

  @IsOptional()
  @IsUUID('4')
  enumCategoryId?: string;

  @IsEnum(SubTableType)
  @IsOptional()
  subTableType?: SubTableType;

  @IsEnum(SubTableWritableStrategy)
  @IsOptional()
  subTableWritableStrategy?: SubTableWritableStrategy;

  @IsEnum(SubTableQueryStrategy)
  @IsOptional()
  subTableQueryStrategy?: SubTableQueryStrategy;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUUID('4')
  subTableId?: string;
}

export class SaveTableDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tableName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => SaveTableColDto)
  @IsOptional()
  cols?: SaveTableColDto[];
}
