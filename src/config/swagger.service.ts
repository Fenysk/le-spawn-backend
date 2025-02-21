import { Injectable, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerAuthMiddleware } from './swagger.middleware';

@Injectable()
export class SwaggerService {
  private readonly customSiteTitle = 'Le Spawn - API Documentation';
  private readonly description = 'L\'application ultime pour les collectionneurs';

  constructor(private readonly configService: ConfigService) { }

  setup(app: INestApplication) {
    const docPath = '/doc';
    
    if (this.configService.get('NODE_ENV') !== 'development') {
      const middleware = new SwaggerAuthMiddleware(this.configService);
      app.use(docPath, middleware.use.bind(middleware));
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
