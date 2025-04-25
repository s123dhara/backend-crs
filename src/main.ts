import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { SystemConfig } from './config/systemConfig';
import * as path from 'path';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const systemConfig = new SystemConfig(new ConfigService());
  const PORT = systemConfig.port;

  app.enableCors({
    origin: [systemConfig.clientUri],
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

    console.log(systemConfig.clientPort)
    console.log(systemConfig.clientUri)
    console.log(path.join(__dirname, 'Mailer', 'templates'))
    console.log(__dirname + '\\Mailer\\templates')



  });

}


bootstrap();
