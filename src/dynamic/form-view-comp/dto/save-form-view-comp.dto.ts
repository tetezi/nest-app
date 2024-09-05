import {
  DynamicFormViewCompDataSourceType,
  DynamicFormViewCompFormSourceType,
} from '@prisma/client';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class SaveFormViewCompDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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
