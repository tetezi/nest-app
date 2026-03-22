import { appConfigFactory, type AppConfig } from './app.config';
import { AuthConfig, authConfigFactory } from './auth.config';
import { type OpenAIConfig, openAIConfigFactory } from './openAI.config';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  openAI: OpenAIConfig;
};

export const allConfigFactory = [
  appConfigFactory,
  authConfigFactory,
  openAIConfigFactory,
];
