import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AttributeController } from "./attribute.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [AttributeController],
  providers: [PrismaService],
})
export class AttributeModule {}
