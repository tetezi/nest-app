import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SaveThirdPartyTableDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  addUrl: string;

  @IsString()
  @IsOptional()
  delUrl: string;

  @IsString()
  @IsOptional()
  editUrl: string;

  @IsString()
  @IsOptional()
  getListUrl: string;

  @IsString()
  @IsOptional()
  getDetailUrl: string;

  @IsString()
  @IsOptional()
  description?: string;
}
