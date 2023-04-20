import {
  AccountWithoutPassword,
  AuthGuard,
  CreateProductDto,
  GetUser,
  Price,
  PrismaService,
  ProductAttribute,
  Roles,
  S3Service,
  UpdateProductDto,
} from "@app/common";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";

@Controller("product")
export class ProductController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  @Get("health")
  async health() {
    return "product";
  }

  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @Post()
  async create(
    @GetUser() user: AccountWithoutPassword,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const { name, description, categoryId, attributes, prices } =
      createProductDto;

    const parsedAttributes = attributes
      ? (JSON.parse(attributes) as ProductAttribute[])
      : undefined;

    const parsedPrices = prices ? (JSON.parse(prices) as Price[]) : undefined;

    const _images: Array<{ key: string; url: string }> = [];

    try {
      for (const image of images) {
        const key = `product-images/${randomUUID()}.${image.originalname
          .split(".")
          .pop()}`;
        const url = `${this.configService.get<string>(
          "SPACES_CDN_ENDPOINT",
        )}${key}`;

        await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        );

        _images.push({ key, url });
      }

      return this.prismaService.product.create({
        data: {
          name,
          description,
          categoryId,
          businessUserId: user.role === Role.BUSINESS ? user.id : null,
          productAttributes: {
            createMany: parsedAttributes
              ? {
                  data: parsedAttributes,
                }
              : undefined,
          },
          prices: {
            createMany: parsedPrices
              ? {
                  data: parsedPrices,
                }
              : undefined,
          },
          images: {
            createMany:
              _images.length > 0
                ? {
                    data: _images,
                  }
                : undefined,
          },
        },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Get()
  async findMany() {
    return this.prismaService.product.findMany({
      include: {
        category: true,
        prices: true,
        images: true,
        business: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  @Get(":id")
  async findUnique(@Param("id") id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
        productAttributes: true,
        prices: true,
        images: true,
        business: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @Patch(":id")
  async update(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (user.role === Role.BUSINESS && product.businessUserId !== user.id) {
      throw new ForbiddenException();
    }

    const { name, description, categoryId, attributes, prices } =
      updateProductDto;

    const parsedAttributes = attributes
      ? (JSON.parse(attributes) as ProductAttribute[])
      : undefined;

    const parsedPrices = prices ? (JSON.parse(prices) as Price[]) : undefined;

    const _images: Array<{ key: string; url: string }> = [];

    try {
      for (const image of images) {
        const key = `product-images/${randomUUID()}.${image.originalname
          .split(".")
          .pop()}`;
        const url = `${this.configService.get<string>(
          "SPACES_CDN_ENDPOINT",
        )}${key}`;

        await this.s3Service.send(
          new PutObjectCommand({
            Bucket: this.configService.get<string>("SPACES_BUCKET"),
            Key: key,
            Body: image.buffer,
            ContentLength: image.size,
            ACL: "public-read",
          }),
        );

        _images.push({ key, url });
      }

      return this.prismaService.product.update({
        data: {
          name,
          description,
          categoryId,
          productAttributes: {
            deleteMany: parsedAttributes ? {} : undefined,
            createMany: parsedAttributes
              ? {
                  data: parsedAttributes,
                }
              : undefined,
          },
          prices: {
            deleteMany: parsedPrices ? {} : undefined,
            createMany: parsedPrices
              ? {
                  data: parsedPrices,
                }
              : undefined,
          },
          images: {
            deleteMany: _images.length > 0 ? {} : undefined,
            createMany:
              _images.length > 0
                ? {
                    data: _images,
                  }
                : undefined,
          },
        },
        where: { id },
      });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard)
  @Delete(":id")
  async delete(
    @GetUser() user: AccountWithoutPassword,
    @Param("id") id: string,
  ) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (user.role === Role.BUSINESS && product.businessUserId !== user.id) {
      throw new ForbiddenException();
    }

    return this.prismaService.product.delete({
      where: { id },
    });
  }
}
