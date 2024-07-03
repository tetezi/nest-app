import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  userNo: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
