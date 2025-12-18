import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// 마이그레이션 생성을 위한 별도 설정
// Railway/Aiven DB 환경 변수를 사용하여 마이그레이션 생성
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
   * 마이그레이션 생성 시에는 synchronize를 false로 유지
   */
  synchronize: false,

  /**
   * 마이그레이션 생성 시 상세 로깅 활성화
   */
  logging: ['error', 'warn', 'schema'],

  /**
   * 엔티티 경로 - 개발 환경 기준 (마이그레이션 생성은 로컬에서)
   */
  entities: [join(__dirname, '../**/*.entity.ts')],

  /**
   * 마이그레이션 경로
   */
  migrations: [join(__dirname, '../migrations/*.ts')],

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

