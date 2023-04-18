import { AuthGuard, PrismaService, Roles } from "@app/common";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";

@Controller("order")
export class OrderController {
  constructor(private readonly prismaService: PrismaService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async findMany() {
    return this.prismaService.order.findMany();
  }
}
