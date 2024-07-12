import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'ttz',
  password: '258369',
  database: 'workspace',
  migrations: ['src/migrations/*.ts'],
  entities: ['src/**/entities/*.entity{.js,.ts}'],
});
