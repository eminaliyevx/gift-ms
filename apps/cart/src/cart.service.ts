import {
  AccountWithoutPassword,
  CartItem,
  CheckoutDto,
  CreateCartDto,
  PrismaService,
} from "@app/common";
import { HttpService } from "@nestjs/axios";
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { Discount, DiscountType, Prisma } from "@prisma/client";
import { catchError, lastValueFrom, map } from "rxjs";
import Stripe from "stripe";

@Injectable()
export class CartService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    @Inject("payment") private readonly paymentService: ClientProxy,
  ) {}

  async findMany<T extends Prisma.CartFindManyArgs>(
    args?: Prisma.SelectSubset<T, Prisma.CartFindManyArgs>,
  ) {
    return this.prismaService.cart.findMany(args);
  }

  async addToCart(userId: number, createCartDto: CreateCartDto) {
    const { items } = createCartDto;

    const cart = await this.findMany({ where: { userId } });

    const itemsToAdd: CartItem[] = [];
    const itemsToDelete: CartItem[] = [];

    for (const item of cart) {
      const foundItem = items.find((i) => i.productId === item.productId);

      if (foundItem) {
        await this.prismaService.cart.update({
          data: {
            quantity: foundItem.quantity,
          },
          where: { userId_productId: { userId, productId: item.productId } },
        });
      } else {
        itemsToDelete.push(item);
      }
    }

    for (const item of items) {
      const foundItem = cart.find((i) => i.productId === item.productId);

      if (!foundItem) {
        itemsToAdd.push(item);
      }
    }

    await Promise.all([
      this.prismaService.cart.createMany({
        data: itemsToAdd.map((item) => ({ userId, ...item })),
      }),
      this.prismaService.cart.deleteMany({
        where: {
          userId,
          productId: {
            in: itemsToDelete.map(({ productId }) => productId),
          },
        },
      }),
    ]);

    return this.findMany({ where: { userId } });
  }

  async applyDiscount(total: number, discountCode?: string) {
    const now = new Date();
    let discountTotal = total;

    const discount = discountCode
      ? await lastValueFrom(
          this.httpService
            .get<Discount>(
              `${this.configService.get<string>(
                "DISCOUNT_HTTP_SERVICE_URL",
              )}/discount/code/${discountCode}`,
            )
            .pipe(map((response) => response.data)),
        )
      : null;

    if (!discount) {
      return total;
    }

    if (discount.remaining === 0) {
      return total;
    }

    if (
      !discount.endDate ||
      (new Date(discount.startDate) < now && new Date(discount.endDate) > now)
    ) {
      switch (discount.type) {
        case DiscountType.PERCENTAGE_TOTAL:
          discountTotal =
            discountTotal - (discountTotal * discount.value) / 100;
          break;
        case DiscountType.FIXED_TOTAL:
          discountTotal -= discount.value;
          break;
        default:
          break;
      }
    }

    return discountTotal;
  }

  async findTotal(userId: number, discountCode?: string) {
    const now = new Date();

    const cart = await this.findMany({
      where: { userId },
      select: {
        quantity: true,
        product: {
          select: {
            id: true,
            prices: {
              select: {
                id: true,
                value: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    let total = 0;

    cart.forEach((item) => {
      const price = item.product.prices.find(
        (_price) =>
          !_price.endDate || (_price.startDate < now && _price.endDate > now),
      );

      total += item.quantity * price.value;
    });

    const discountTotal = await this.applyDiscount(total, discountCode);

    return {
      total,
      discountTotal,
      cart,
    };
  }

  async checkout(user: AccountWithoutPassword, checkoutDto: CheckoutDto) {
    const { total, discountTotal, cart } = await this.findTotal(
      user.id,
      checkoutDto.discountCode,
    );

    return this.paymentService
      .send<Stripe.Response<Stripe.PaymentIntent>>("charge-customer", {
        user,
        paymentDto: { ...checkoutDto, amount: discountTotal * 100 },
      })
      .pipe(
        map(async (response) => {
          const order = await this.prismaService.order.create({
            data: {
              id: response.id,
              total,
              discountTotal,
              location: checkoutDto.location,
              note: checkoutDto.note,
              customer: {
                connect: {
                  userId: user.id,
                },
              },
              items: {
                createMany: {
                  data: cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                  })),
                },
              },
            },
          });

          await this.prismaService.cart.deleteMany({
            where: { userId: user.id },
          });

          if (discountTotal < total) {
            await this.prismaService.discount.update({
              data: {
                remaining: {
                  decrement: 1,
                },
              },
              where: { code: checkoutDto.discountCode },
            });
          }

          return order;
        }),
        catchError(() => {
          throw new InternalServerErrorException();
        }),
      );
  }
}
