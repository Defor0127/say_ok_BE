import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const isDev = nodeEnv === 'development';
        const useSsl = !isDev;

        return {
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

          retryAttempts: 10,
          retryDelay: 3000,

          ...(useSsl
            ? {
              ssl: true,
              extra: {
                ssl: { rejectUnauthorized: false },
              },
            }
            : {}),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule { }
