import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  isBoolean,
  IsBoolean,
} from 'class-validator';

enum MenuType {
  Iframe = 'Iframe',
  View = 'View',
  Group = 'Group',
}
export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MenuType)
  type: MenuType;

  @IsString()
  @IsOptional()
  routerPath: string;

  @IsString()
  @IsOptional()
  url: string;

  @IsNumber()
  @IsOptional()
  sort: number;

  @IsBoolean()
  isEnabled: boolean;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  parentMenuId: string;
}
