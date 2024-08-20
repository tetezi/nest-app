import { appConfigFactory, type AppConfig } from './app.config';
import { AuthConfig, authConfigFactory } from './auth.config';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
};

export const allConfigFactory = [appConfigFactory, authConfigFactory];
