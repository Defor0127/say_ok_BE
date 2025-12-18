import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { CommonResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 필수 환경 변수 검증
  const requiredEnvVars = ['DB_NAME', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !configService.get(varName)
  );
  if (missingEnvVars.length > 0) {
    throw new Error(
      `필수 환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(', ')}`
    );
  }

  app.use(cookieParser())
  // CORS 설정
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // 전역 Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new CommonResponseInterceptor(),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('SilverLink API')
    .setDescription('SilverLink 시니어 커뮤니티 플랫폼 API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();

