import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CategoryController } from "./category.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [CategoryController],
  providers: [PrismaService],
})
export class CategoryModule {}
