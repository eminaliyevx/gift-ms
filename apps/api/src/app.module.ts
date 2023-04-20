import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../..", "public"),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
