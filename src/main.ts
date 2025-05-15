import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { SystemConfig } from './config/systemConfig';
import * as path from 'path';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const systemConfig = new SystemConfig(new ConfigService());
  const PORT = systemConfig.port;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.enableCors({
    origin: [systemConfig.clientUri, "http://localhost:3000"],
    credentials: true
  })

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  const connection = app.get<Connection>(getConnectionToken());
  connection.on('connected', () => Logger.log('✅ MongoDB connected'));
  connection.on('error', (err) => Logger.error('❌ MongoDB error', err));

  await app.listen(PORT, () => {
    Logger.log(`Server is Running on ${systemConfig.backendUri}`)
  });
}


bootstrap();
