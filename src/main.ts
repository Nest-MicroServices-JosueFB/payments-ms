import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Payments-ms')

  const app = await NestFactory.create(AppModule, {
    // Para enviar webhook stripe
    rawBody: true
  });

  //+ Al ser Aplicacion hibrida no se comparten los globalpipes, interceptors, guards o filters
  // Si se quiere necesita ponerse {inheritAppConfig: true}

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers
    },
  }, {inheritAppConfig: true})

  //+ Aplicacion hibrida
  await app.startAllMicroservices();
  await app.listen(envs.port);
  //+ Aplicacion hibrida

  logger.log(`Payments Microservice running on port ${envs.port} `)
}
bootstrap();
