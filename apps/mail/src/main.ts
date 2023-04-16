import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { MailModule } from "./mail.module";

async function bootstrap() {
  const app = await NestFactory.create(MailModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: configService.get("TCP_PORT"),
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
