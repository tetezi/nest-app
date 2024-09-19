import {
  DynamicFormViewCompDataSourceType,
  DynamicFormViewCompFormSourceType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class SaveFormViewCompDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Object)
  @IsArray()
  tableColumns: object[];

  @IsEnum(DynamicFormViewCompDataSourceType)
  dataSourceType: DynamicFormViewCompDataSourceType;

  @IsOptional()
  @IsUUID('4')
  dynamicTableId?: string;

  @IsEnum(DynamicFormViewCompFormSourceType)
  formSourceType: DynamicFormViewCompFormSourceType;
  @IsOptional()
  @IsUUID('4')
  dynamicFormId?: string;
}
