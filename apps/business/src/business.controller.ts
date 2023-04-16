import { CreateBusinessDto, PrismaService, hash } from "@app/common";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Role } from "@prisma/client";

@Controller("business")
export class BusinessController {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject("auth") private readonly authService: ClientProxy,
  ) {}

  @Post("register")
  async register(
    @Body()
    { name, ...user }: CreateBusinessDto,
  ) {
    const business = await this.prismaService.user.create({
      data: {
        ...user,
        password: hash(user.password),
        role: Role.BUSINESS,
        business: { create: { name } },
      },
      select: {
        id: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.authService.emit("send-confirmation-email", business.id);

    return business;
  }
}
