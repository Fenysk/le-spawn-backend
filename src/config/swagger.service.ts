import { Injectable, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerAuthMiddleware } from './swagger.middleware';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SwaggerService {
  private readonly customSiteTitle = 'Le Spawn - API Documentation';
  private readonly description = 'L\'application ultime pour les collectionneurs';

  constructor(private readonly configService: ConfigService) { }

  setup(app: INestApplication) {
    const docPath = '/doc';
    
    if (this.configService.get('NODE_ENV') !== 'development') {
      const middleware = new SwaggerAuthMiddleware(this.configService);
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith(docPath)) {
          return middleware.use(req, res, next);
        }
        next();
      });
    }

    const config = new DocumentBuilder()
      .setTitle(this.customSiteTitle)
      .setDescription(this.description)
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('/doc', app, document, {
      customSiteTitle: this.customSiteTitle,
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
}
