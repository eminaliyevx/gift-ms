import {
  AccountWithoutPassword,
  AuthGuard,
  CheckoutDto,
  CreateCartDto,
  GetUser,
  Roles,
} from "@app/common";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get("health")
  async health() {
    return "cart";
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get()
  async getCart(@GetUser() user: AccountWithoutPassword) {
    return this.cartService.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            prices: true,
            images: true,
          },
        },
      },
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Post()
  async addToCart(
    @GetUser() user: AccountWithoutPassword,
    @Body() createCartDto: CreateCartDto,
  ) {
    return this.cartService.addToCart(user.id, createCartDto);
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get("total")
  async getCartTotal(
    @GetUser() user: AccountWithoutPassword,
    @Query("discountCode") discountCode?: string,
  ) {
    const { total, discountTotal } = await this.cartService.findTotal(
      user.id,
      discountCode,
    );

    return { total, discountTotal };
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Post("checkout")
  async checkout(
    @GetUser() user: AccountWithoutPassword,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return this.cartService.checkout(user, checkoutDto);
  }
}
