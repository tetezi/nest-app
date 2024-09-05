import {
  IsOptional,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsJSON,
} from 'class-validator';

export class SaveFormDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsJSON()
  schemas: Record<string, any>;
}
