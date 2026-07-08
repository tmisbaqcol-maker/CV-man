import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(
    /\/+$/,
    '',
  );
  // Vercel preview deployments get a random per-commit hash in their domain
  // (e.g. https://cv-man-<hash>-tmis.vercel.app), distinct from the stable
  // production domain in FRONTEND_URL. Allow both so preview links work too.
  const vercelPreviewPattern = /^https:\/\/cv-man-[a-z0-9]+-tmis\.vercel\.app$/;
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin === frontendUrl || vercelPreviewPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('CV Manager API')
    .setDescription('API para la gestión de hojas de vida')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
