import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const dbSsl = process.env.DB_SSL === 'true' || (isProd && process.env.DB_SSL !== 'false');

const baseConfig: DataSourceOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  /**
   * ⚠️ 운영에서는 절대 true 유지 X
   * 초기 1회 스키마 생성 후 반드시 false
   */
  synchronize: false,

  /**
   * 운영 문제 파악용 (필요 없으면 줄여도 됨)
   */
  logging: isProd ? ['error'] : true,

  /**
   * 🔥 가장 중요한 부분
   * prod / dev 모두 안정적으로 엔티티 인식
   */
  entities: [
    isProd
      ? 'dist/**/*.entity.js'
      : 'src/**/*.entity.ts',
  ],

  /**
   * migration 경로도 단순하게
   */
  migrations: [
    isProd
      ? 'dist/migrations/*.js'
      : 'src/migrations/*.ts',
  ],

  migrationsTableName: 'migrations',
  migrationsRun: false,

  charset: 'utf8mb4',
};

// Aiven MariaDB는 SSL 연결이 필수입니다
if (dbSsl) {
  (baseConfig as any).ssl = true;
  (baseConfig as any).extra = {
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

export default new DataSource(baseConfig);
