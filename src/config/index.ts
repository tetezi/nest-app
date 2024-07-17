import { appConfigFactory, type AppConfig } from './app.config';
import { databaseConfigFactory, type DatabaseConfig } from './database.config';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
};

export const allConfigFactory = [appConfigFactory, databaseConfigFactory];
