import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false,
  logging: true,

  entities: [
    isProd
      ? 'dist/**/*.entity.{js}'
      : 'src/**/*.entity.{ts}',
  ],

  migrations: [
    isProd
      ? 'dist/migrations/*.{js}'
      : 'src/migrations/*.{ts}',
  ],

  charset: 'utf8mb4',
});
