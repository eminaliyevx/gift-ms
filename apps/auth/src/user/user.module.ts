import { PrismaService } from "@app/common";
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  providers: [PrismaService, UserService],
  exports: [UserService],
})
export class UserModule {}
