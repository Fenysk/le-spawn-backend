import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAccessAuthGuard } from './auth/guards/jwt-access-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalGuards(
    new JwtAccessAuthGuard(app.get(Reflector)),
    new RolesGuard(app.get(Reflector)),
  );

  await app.listen(3000);
}
bootstrap();
