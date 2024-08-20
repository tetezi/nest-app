import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsString()
  @IsNotEmpty()
  userNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
