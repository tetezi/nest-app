import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import validateConfig from 'src/common/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  OPENAI_BASEURL: string;

  @IsString()
  @IsNotEmpty()
  OPENAI_APIKEY: string;
}

export const openAIConfigFactory = registerAs('openAI', () => {
  const env = validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    baseUrl: env.OPENAI_BASEURL,
    apiKey: env.OPENAI_APIKEY,
  };
});

export type OpenAIConfig = ReturnType<typeof openAIConfigFactory>;
