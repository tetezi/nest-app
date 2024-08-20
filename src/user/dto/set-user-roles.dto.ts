import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SetUserRolesDto {
  @IsString()
  @IsUUID('4')
  id: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
