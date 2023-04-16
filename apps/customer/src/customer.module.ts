import { PrismaService } from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CustomerController } from "./customer.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "./apps/customer/.env",
    }),
    ClientsModule.registerAsync([
      {
        name: "auth",
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get("AUTH_TCP_SERVICE_HOST"),
            port: configService.get("AUTH_TCP_SERVICE_PORT"),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CustomerController],
  providers: [PrismaService],
})
export class CustomerModule {}
