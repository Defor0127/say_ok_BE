import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

const isDev = configService.get('NODE_ENV') === 'development';

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

  extra: {
    ssl: { rejectUnauthorized: false },
  },
};

export default new DataSource(typeOrmConfig);
