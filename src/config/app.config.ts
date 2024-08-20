import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import validateConfig from 'src/common/validate-config';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  API_PREFIX: string;
}
export type AppConfig = {
  nodeEnv: string;
  workingDirectory: string;
  port: number;
  apiPrefix: string;
};

export const appConfigFactory = registerAs<AppConfig>('app', () => {
  const env = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: env.NODE_ENV || 'development',
    workingDirectory: process.env.PWD || process.cwd(),
    port: env.APP_PORT || 3000,
    apiPrefix: env.API_PREFIX || 'api',
  };
});
