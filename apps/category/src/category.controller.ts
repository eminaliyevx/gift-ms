import {
  AuthGuard,
  CreateCategoryDto,
  PrismaService,
  Roles,
  UpdateCategoryDto,
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

@Controller("category")
export class CategoryController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get("health")
  async health() {
    return "category";
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const { attributes, ...rest } = createCategoryDto;

    return this.prismaService.category.create({
      data: {
        ...rest,
        attributes: {
          connect: attributes?.map((id) => ({ id })),
        },
      },
      include: { attributes: true },
    });
  }

  @Get()
  async findMany() {
    return this.prismaService.category.findMany();
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: { attributes: true },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: {
        attributes: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const { attributes, ...rest } = updateCategoryDto;
    const categoryAttributes = category.attributes.map(({ id }) => id);

    const connect = attributes
      ? attributes
          .filter((attribute) => !categoryAttributes.includes(attribute))
          .map((id) => ({ id }))
      : undefined;

    const disconnect = attributes
      ? categoryAttributes
          .filter(
            (categoryAttribute) => !attributes.includes(categoryAttribute),
          )
          .map((id) => ({ id }))
      : undefined;

    return this.prismaService.category.update({
      data: {
        ...rest,
        attributes: {
          disconnect,
          connect,
        },
      },
      where: { id },
      include: { attributes: true },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.prismaService.category.delete({
      where: { id },
    });
  }
}
