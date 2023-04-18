import { CreateCustomerDto, PrismaService, hash } from "@app/common";
import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Role } from "@prisma/client";

@Controller("customer")
export class CustomerController {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject("auth") private readonly authService: ClientProxy,
  ) {}

  @Get("health")
  async health() {
    return "customer";
  }

  @Post("register")
  async register(
    @Body()
    { firstName, lastName, birthDate, gender, ...user }: CreateCustomerDto,
  ) {
    const customer = await this.prismaService.user.create({
      data: {
        ...user,
        password: hash(user.password),
        role: Role.CUSTOMER,
        customer: {
          create: {
            firstName,
            lastName,
            birthDate: new Date(birthDate),
            gender,
          },
        },
      },
      select: {
        id: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.authService.emit("send-confirmation-email", customer.id);

    return customer;
  }
}
