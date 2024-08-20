import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SaveRoleDto {
  @IsOptional()
  @IsUUID('4')
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  // @IsOptional()
  // @IsUUID('4', { each: true })
  // userIds: string[];

  // @IsOptional()
  // @IsUUID('4', { each: true })
  // menuIds: string[];
}
