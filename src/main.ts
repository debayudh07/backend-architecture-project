import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { logToFile } from '../utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Swagger / OpenAPI ────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('NestJS Backend API')
    .setDescription(
      'A robust, event-driven backend with JWT auth, Redis caching, and a MongoDB job queue.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refresh-token',
    )
    .addTag('Auth', 'User registration, login, logout, and token refresh')
    .addTag('Users', 'User profile and lookup')
    .addTag('Logs', 'Application log viewer')
    .addTag('App', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ── Request logging middleware ───────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;
      console.log(message);
      void logToFile(message, 'requests');
    });
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
