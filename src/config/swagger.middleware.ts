import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    const swaggerUser = this.configService.get<string>('SWAGGER_USER');
    const swaggerPassword = this.configService.get<string>('SWAGGER_PASSWORD');

    if (!auth) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
      res.status(401).send('Authentication required');
      return;
    }

    const [, credentials] = auth.split(' ');
    const [username, password] = Buffer.from(credentials, 'base64')
      .toString()
      .split(':');

    if (username === swaggerUser && password === swaggerPassword) {
      next();
    } else {
      res.status(401).send('Invalid credentials');
    }
  }
}
