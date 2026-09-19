import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

function resolveCorsOrigin(): boolean | string[] {
  const configured = process.env.CORS_ORIGINS
    ?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (configured?.length) {
    return configured;
  }

  const stage = process.env.NODE_ENV ?? 'dev';
  return stage === 'production' ? [] : true;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const http = app.getHttpAdapter().getInstance();

  http.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: process.env.APP_NAME ?? 'api',
      endpoints: {
        api: '/api',
        health: '/api/health',
      },
    });
  });

  app.setGlobalPrefix('api');
  app.enableCors({ origin: resolveCorsOrigin() });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
