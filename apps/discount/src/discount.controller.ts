import {
  AuthGuard,
  CreateDiscountDto,
  PrismaService,
  Roles,
  UpdateDiscountDto,
} from "@app/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";

@Controller("discount")
export class DiscountController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get("health")
  async health() {
    return "discount";
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.prismaService.discount.create({
      data: createDiscountDto,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.prismaService.discount.findMany();
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const discount = await this.prismaService.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return discount;
  }

  @Get("code/:code")
  async findByCode(@Param("code") code: string) {
    const discount = await this.prismaService.discount.findUnique({
      where: { code },
    });

    return discount;
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    const discount = await this.prismaService.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.prismaService.discount.update({
      data: updateDiscountDto,
      where: { id },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const discount = await this.prismaService.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    return this.prismaService.discount.delete({
      where: { id },
    });
  }
}
