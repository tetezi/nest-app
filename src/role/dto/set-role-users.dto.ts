import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SetRoleUsersDto {
  @IsUUID('4')
  id: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  userIds: string[];
}
