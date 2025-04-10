import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:5173",
    credentials : true
  })

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  const connection = app.get<Connection>(getConnectionToken());
  connection.on('connected', () => Logger.log('✅ MongoDB connected'));
  connection.on('error', (err) => Logger.error('❌ MongoDB error', err));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
