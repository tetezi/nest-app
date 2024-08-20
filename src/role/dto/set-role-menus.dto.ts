import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SetRoleMenusDto {
  @IsUUID('4')
  id: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  menuIds: string[];
}
