import { PrismaService } from "@app/common";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CustomerController } from "./customer.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: "auth",
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: "auth",
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
