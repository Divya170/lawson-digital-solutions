import './config';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1); // correct client IPs for rate limiting behind the Next.js proxy
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  // Staff-uploaded photos (outside the /api prefix).
  app.useStaticAssets(config.uploadDir, { prefix: '/uploads/', index: false, maxAge: '7d' });
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.frontendOrigin, credentials: true });
  app.enableShutdownHooks();
  await app.listen(config.port);
  Logger.log(`API ready on http://localhost:${config.port}/api  (db: ${config.databasePath})`, 'Bootstrap');
}

bootstrap();
