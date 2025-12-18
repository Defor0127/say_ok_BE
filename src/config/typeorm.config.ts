import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

const NODE_ENV = configService.get<string>('NODE_ENV', 'development');
const isDev = NODE_ENV === 'development';

// 배포(운영)에서만 SSL 사용 (Aiven 등)
const useSsl = !isDev;

export const typeOrmConfig: DataSourceOptions = {
  type: 'mariadb',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: Number(configService.get<string>('DB_PORT', '3306')),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_NAME', ''),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  synchronize: isDev,
  logging: isDev,
  charset: 'utf8mb4',
  ...(useSsl
    ? {
      ssl: true,
      extra: {
        ssl: { rejectUnauthorized: false },
      },
    }
    : {}),
};

export default new DataSource(typeOrmConfig);
