import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Test } from "@nestjs/testing";
import { DiscountType, Gender, Role, User } from "@prisma/client";
import { CartService } from "../src/cart.service";

describe("CartService", () => {
  let cartService: CartService;
  let prismaService: PrismaService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: "./.env.test",
        }),
        HttpModule,
        ClientsModule.registerAsync([
          {
            name: "payment",
            useFactory: (configService: ConfigService) => ({
              transport: Transport.TCP,
              options: {
                host: "0.0.0.0",
                port: configService.get("PAYMENT_TCP_SERVICE_PORT"),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [ConfigService, CartService, PrismaService],
    }).compile();

    cartService = moduleRef.get<CartService>(CartService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);

    user = await prismaService.user.create({
      data: {
        email: "custo@test.com",
        phone: "+994553131313",
        password: "qwerty123",
        role: Role.CUSTOMER,
        customer: {
          create: {
            firstName: "Emin",
            lastName: "Aliyev",
            birthDate: new Date("2002-06-23"),
            gender: Gender.MALE,
          },
        },
      },
    });

    await prismaService.category.create({
      data: { id: "testCat", name: "testCategory" },
    });

    await prismaService.product.create({
      data: {
        id: "testProd1",
        name: "testProduct1",
        description: "testDescription1",
        categoryId: "testCat",
        prices: { createMany: { data: [{ value: 150 }] } },
      },
    });

    await prismaService.product.create({
      data: {
        id: "testProd2",
        name: "testProduct2",
        description: "testDescription2",
        categoryId: "testCat",
        prices: { createMany: { data: [{ value: 200 }] } },
      },
    });

    await prismaService.discount.create({
      data: {
        code: "TEST_PERCENTAGE_DISCOUNT_CODE",
        type: DiscountType.PERCENTAGE_TOTAL,
        value: 15,
        startDate: new Date(2023, 1, 1),
        endDate: new Date(2024, 1, 1),
      },
    });

    await prismaService.discount.create({
      data: {
        code: "TEST_FIXED_DISCOUNT_CODE",
        type: DiscountType.FIXED_TOTAL,
        value: 15,
        startDate: new Date(2023, 1, 1),
        endDate: new Date(2024, 1, 1),
      },
    });
  });

  describe.only("addToCart", () => {
    it("should add items to cart", async () => {
      const createCartDto = {
        items: [
          { productId: "testProd1", quantity: 2 },
          { productId: "testProd2", quantity: 1 },
        ],
      };

      const result = await cartService.addToCart(user.id, createCartDto);

      expect(result.every((item) => item.userId === user.id)).toBe(true);
    });
  });

  describe("applyDiscount", () => {
    it("should return discount total if discount type is PERCENTAGE_TOTAL", async () => {
      const result = await cartService.applyDiscount(
        1300,
        "TEST_PERCENTAGE_DISCOUNT_CODE",
      );

      expect(result).toBe(1300 * 0.85);
    });

    it("should return discount total if discount type is FIXED_TOTAL", async () => {
      const result = await cartService.applyDiscount(
        60,
        "TEST_FIXED_DISCOUNT_CODE",
      );

      expect(result).toBe(45);
    });
  });

  describe("findTotal", () => {
    it("should return total without a discount code", async () => {
      const { total } = await cartService.findTotal(user.id, undefined);

      expect(total).toBe(500);
    });

    it("should return total with a discount code", async () => {
      const { total, discountTotal } = await cartService.findTotal(
        user.id,
        "TEST_PERCENTAGE_DISCOUNT_CODE",
      );

      expect(total).toBe(500);
      expect(discountTotal).toBe(500 * 0.85);
    });
  });
});
