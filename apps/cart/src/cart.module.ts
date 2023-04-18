import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: "payment",
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: "payment",
            port: configService.get("PAYMENT_TCP_SERVICE_PORT"),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CartController],
  providers: [PrismaService, CartService],
})
export class CartModule {}
