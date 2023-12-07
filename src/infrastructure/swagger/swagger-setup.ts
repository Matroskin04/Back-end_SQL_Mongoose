import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerSetup(app) {
  const config = new DocumentBuilder()
    .setTitle('Content platform')
    .setDescription('The content platform API description')
    .setVersion('1.0')
    .addTag('Content platform')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
}
