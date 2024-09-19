import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
export class SaveFormDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  beforeSubmit?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Object)
  @IsArray()
  schemas: object[];
}
