import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAccessAuthGuard } from './auth/guards/jwt-access-auth.guard';
import { SwaggerService } from './config/swagger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalGuards(
    new JwtAccessAuthGuard(app.get(Reflector)),
    new RolesGuard(app.get(Reflector)),
  );

  app.enableCors();

  const swaggerService = app.get(SwaggerService);
  swaggerService.setup(app);

  await app.listen(3000);
}
bootstrap();
