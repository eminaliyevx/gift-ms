import { PrismaService } from "@app/common";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DiscountModule } from "./discount.module";

async function bootstrap() {
  const app = await NestFactory.create(DiscountModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await prismaService.enableShutdownHooks(app);

  await app.listen(configService.get<number>("DISCOUNT_HTTP_SERVICE_PORT"));
}
bootstrap();
