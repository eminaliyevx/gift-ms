import { PrismaService } from "@app/common";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ProductModule } from "./product.module";

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await prismaService.enableShutdownHooks(app);

  await app.listen(configService.get<number>("PRODUCT_HTTP_SERVICE_PORT"));
}
bootstrap();
