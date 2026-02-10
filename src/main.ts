import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logToFile } from '../utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
}
bootstrap();
