import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from 'src/common/validate-config';
import { ClassConstructor } from 'class-transformer/types/interfaces';

class EnvironmentVariablesValidator {
  @IsString()
  AUTH_JWT_SECRET: string;

  @IsString()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;

  // @IsString()
  // AUTH_REFRESH_SECRET: string;

  // @IsString()
  // AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

  // @IsString()
  // AUTH_FORGOT_SECRET: string;

  // @IsString()
  // AUTH_FORGOT_TOKEN_EXPIRES_IN: string;

  // @IsString()
  // AUTH_CONFIRM_EMAIL_SECRET: string;

  // @IsString()
  // AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN: string;
}
export type AuthConfig = {
  secret: string;
  expires?: string;
  // refreshSecret?: string;
  // refreshExpires?: string;
  // forgotSecret?: string;
  // forgotExpires?: string;
  // confirmEmailSecret?: string;
  // confirmEmailExpires?: string;
};

export const authConfigFactory = registerAs<AuthConfig>('auth', () => {
  const env = validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    secret: env.AUTH_JWT_SECRET,
    expires: env.AUTH_JWT_TOKEN_EXPIRES_IN,
    // refreshSecret: process.env.AUTH_REFRESH_SECRET,
    // refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
    // forgotSecret: process.env.AUTH_FORGOT_SECRET,
    // forgotExpires: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN,
    // confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
    // confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
  };
});
