import {
  AuthGuard,
  CreateAttributeDto,
  PrismaService,
  Roles,
  UpdateAttributeDto,
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

@Controller("attribute")
export class AttributeController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get("health")
  async health() {
    return "attribute";
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    const { categories, ...rest } = createAttributeDto;

    return this.prismaService.attribute.create({
      data: {
        ...rest,
        categories: {
          connect: categories?.map((id) => ({ id })),
        },
      },
      include: { categories: true },
    });
  }

  @Get()
  async findMany() {
    return this.prismaService.attribute.findMany();
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const attribute = await this.prismaService.attribute.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return attribute;
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    const attribute = await this.prismaService.attribute.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    const { categories, ...rest } = updateAttributeDto;
    const attributeCategories = attribute.categories.map(({ id }) => id);

    const connect = categories
      ? categories
          .filter((category) => !attributeCategories.includes(category))
          .map((id) => ({ id }))
      : undefined;

    const disconnect = categories
      ? attributeCategories
          .filter(
            (attributeCategory) => !categories.includes(attributeCategory),
          )
          .map((id) => ({ id }))
      : undefined;

    return this.prismaService.attribute.update({
      data: {
        ...rest,
        categories: {
          disconnect,
          connect,
        },
      },
      where: { id },
      include: { categories: true },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const attribute = await this.prismaService.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException("Attribute not found");
    }

    return this.prismaService.attribute.delete({
      where: { id },
    });
  }
}
