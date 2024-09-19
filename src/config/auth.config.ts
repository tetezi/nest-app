import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from 'src/common/validate-config';
import { ClassConstructor } from 'class-transformer/types/interfaces';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_JWT_SECRET: string;

  @IsString()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;
}
export type AuthConfig = {
  secret: string;
  expires?: string;
};

export const authConfigFactory = registerAs<AuthConfig>('auth', () => {
  const env = validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    secret: env.AUTH_JWT_SECRET,
    expires: env.AUTH_JWT_TOKEN_EXPIRES_IN,
  };
});
