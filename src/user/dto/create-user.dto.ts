import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Role } from '../entities/role.entity';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '000001', description: 'No of the user' })
  @IsString()
  @IsNotEmpty()
  userNo: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  roleIds: string[];
}
