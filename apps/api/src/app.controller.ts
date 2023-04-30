import {
  AccountWithoutPassword,
  AuthGuard,
  CheckoutDto,
  CreateAttributeDto,
  CreateBusinessDto,
  CreateCartDto,
  CreateCategoryDto,
  CreateCustomerDto,
  CreateDiscountDto,
  CreateProductDto,
  CreateUserDto,
  GetUser,
  LoginUserDto,
  Roles,
  Token,
  UpdateAttributeDto,
  UpdateCategoryDto,
  UpdateDiscountDto,
  UpdateProductDto,
  UpdateUserDto,
} from "@app/common";
import { HttpService } from "@nestjs/axios";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { AxiosError } from "axios";
import * as FormData from "form-data";
import { catchError, map } from "rxjs";

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Get("health")
  async health() {
    return "health";
  }

  @ApiTags("Auth")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post("auth/register")
  async register(@Token() token: string, @Body() createUserDto: CreateUserDto) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "AUTH_HTTP_SERVICE_URL",
          )}/auth/register`,
          createUserDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @Post("auth/login")
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "AUTH_HTTP_SERVICE_URL",
          )}/auth/login`,
          loginUserDto,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get("auth/account")
  async getAccount(@GetUser() user: AccountWithoutPassword) {
    return user;
  }

  @ApiTags("Auth")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @Patch("auth/account")
  async updateAccount(
    @Token() token: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const formData = new FormData();

    updateUserDto.email && formData.append("email", updateUserDto.email);
    updateUserDto.phone && formData.append("phone", updateUserDto.phone);
    image &&
      formData.append("image", Buffer.from(image.buffer), image.originalname);

    try {
      return this.httpService
        .patch<AccountWithoutPassword>(
          `${this.configService.get<string>(
            "AUTH_HTTP_SERVICE_URL",
          )}/auth/account`,
          formData,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Auth")
  @Get("auth/confirm")
  async confirmEmail(@Query("hash") hash: string) {
    try {
      return this.httpService
        .get<AccountWithoutPassword>(
          `${this.configService.get<string>(
            "AUTH_HTTP_SERVICE_URL",
          )}/auth/confirm`,
          { params: { hash } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Customer")
  @Post("customer/register")
  async registerCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "CUSTOMER_HTTP_SERVICE_URL",
          )}/customer/register`,
          createCustomerDto,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Business")
  @Post("business/register")
  async registerBusiness(@Body() createBusinessDto: CreateBusinessDto) {
    try {
      return this.httpService
        .post<AccountWithoutPassword>(
          `${this.configService.get<string>(
            "BUSINESS_HTTP_SERVICE_URL",
          )}/business/register`,
          createBusinessDto,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post("category")
  async createCategory(
    @Token() token: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "CATEGORY_HTTP_SERVICE_URL",
          )}/category`,
          createCategoryDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @Get("category")
  async getCategories() {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "CATEGORY_HTTP_SERVICE_URL",
          )}/category`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @Get("category/:id")
  async getCategory(@Param("id") id: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "CATEGORY_HTTP_SERVICE_URL",
          )}/category/${id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch("category/:id")
  async updateCategory(
    @Token() token: string,
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      return this.httpService
        .patch(
          `${this.configService.get<string>(
            "CATEGORY_HTTP_SERVICE_URL",
          )}/category/${id}`,
          updateCategoryDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Category")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete("category/:id")
  async deleteCategory(@Token() token: string, @Param("id") id: string) {
    try {
      return this.httpService
        .delete(
          `${this.configService.get<string>(
            "CATEGORY_HTTP_SERVICE_URL",
          )}/category/${id}`,
          { headers: { Authorization: token } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post("attribute")
  async createAttribute(
    @Token() token: string,
    @Body() createAttributeDto: CreateAttributeDto,
  ) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "ATTRIBUTE_HTTP_SERVICE_URL",
          )}/attribute`,
          createAttributeDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @Get("attribute")
  async getAttributes() {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "ATTRIBUTE_HTTP_SERVICE_URL",
          )}/attribute`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @Get("attribute/:id")
  async getAttribute(@Param("id") id: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "ATTRIBUTE_HTTP_SERVICE_URL",
          )}/attribute/${id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch("attribute/:id")
  async updateAttribute(
    @Token() token: string,
    @Param("id") id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    try {
      return this.httpService
        .patch(
          `${this.configService.get<string>(
            "ATTRIBUTE_HTTP_SERVICE_URL",
          )}/attribute/${id}`,
          updateAttributeDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Attribute")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete("attribute/:id")
  async deleteAttribute(@Token() token: string, @Param("id") id: string) {
    try {
      return this.httpService
        .delete(
          `${this.configService.get<string>(
            "ATTRIBUTE_HTTP_SERVICE_URL",
          )}/attribute/${id}`,
          { headers: { Authorization: token } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @Post("product")
  async createProduct(
    @Token() token: string,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const formData = new FormData();

    formData.append("name", createProductDto.name);
    formData.append("description", createProductDto.description);
    formData.append("categoryId", createProductDto.categoryId);
    createProductDto.attributes &&
      formData.append("attributes", createProductDto.attributes);
    createProductDto.prices &&
      formData.append("prices", createProductDto.prices);

    images.forEach((image) => {
      formData.append("images", Buffer.from(image.buffer), image.originalname);
    });

    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "PRODUCT_HTTP_SERVICE_URL",
          )}/product`,
          formData,
          {
            headers: { ...formData.getHeaders(), Authorization: token },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @ApiQuery({ name: "take", required: false })
  @ApiQuery({ name: "cursor", required: false })
  @ApiQuery({ name: "name", required: false })
  @ApiQuery({ name: "categoryId", required: false })
  @Get("product")
  async getProducts(
    @Query("take", new DefaultValuePipe(8), ParseIntPipe) take: number,
    @Query("cursor") cursor?: string,
    @Query("name") name?: string,
    @Query("categories", new ParseArrayPipe({ items: String, optional: true }))
    categories?: string[],
  ) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "PRODUCT_HTTP_SERVICE_URL",
          )}/product`,
          {
            params: {
              take,
              cursor,
              name,
              categories,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @Get("product/:id")
  async getProduct(@Param("id") id: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "PRODUCT_HTTP_SERVICE_URL",
          )}/product/${id}`,
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Product")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("images"))
  @Patch("product/:id")
  async updateProduct(
    @Token() token: string,
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const formData = new FormData();

    updateProductDto.name && formData.append("name", updateProductDto.name);
    updateProductDto.description &&
      formData.append("description", updateProductDto.description);
    updateProductDto.categoryId &&
      formData.append("categoryId", updateProductDto.categoryId);
    updateProductDto.attributes &&
      formData.append("attributes", updateProductDto.attributes);
    updateProductDto.prices &&
      formData.append("prices", updateProductDto.prices);

    images.forEach((image) => {
      formData.append("images", Buffer.from(image.buffer), image.originalname);
    });

    try {
      return this.httpService
        .patch(
          `${this.configService.get<string>(
            "PRODUCT_HTTP_SERVICE_URL",
          )}/product/${id}`,
          formData,
          {
            headers: { ...formData.getHeaders(), Authorization: token },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }
  @ApiTags("Product")
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.BUSINESS)
  @UseGuards(AuthGuard)
  @Delete("product/:id")
  async deleteProduct(@Token() token: string, @Param("id") id: string) {
    try {
      return this.httpService
        .delete(
          `${this.configService.get<string>(
            "PRODUCT_HTTP_SERVICE_URL",
          )}/product/${id}`,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post("discount")
  async createDiscount(
    @Token() token: string,
    @Body() createDiscountDto: CreateDiscountDto,
  ) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "DISCOUNT_HTTP_SERVICE_URL",
          )}/discount`,
          createDiscountDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get("discount")
  async getDiscounts(@Token() token: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "DISCOUNT_HTTP_SERVICE_URL",
          )}/discount`,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get("discount/:id")
  async getDiscount(@Token() token: string, @Param("id") id: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "DISCOUNT_HTTP_SERVICE_URL",
          )}/discount/${id}`,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch("discount/:id")
  async updateDiscount(
    @Token() token: string,
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    try {
      return this.httpService
        .patch(
          `${this.configService.get<string>(
            "DISCOUNT_HTTP_SERVICE_URL",
          )}/discount/${id}`,
          updateDiscountDto,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Discount")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete("discount/:id")
  async deleteDiscount(@Token() token: string, @Param("id") id: string) {
    try {
      return this.httpService
        .delete(
          `${this.configService.get<string>(
            "DISCOUNT_HTTP_SERVICE_URL",
          )}/discount/${id}`,
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get("cart")
  async getCart(@Token() token: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>("CART_HTTP_SERVICE_URL")}/cart`,
          { headers: { Authorization: token } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Post("cart")
  async addToCart(
    @Token() token: string,
    @Body() createCartDto: CreateCartDto,
  ) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>("CART_HTTP_SERVICE_URL")}/cart`,
          createCartDto,
          { headers: { Authorization: token } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @ApiQuery({ name: "discountCode", required: false })
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Get("cart/total")
  async getCartTotal(
    @Token() token: string,
    @Query("discountCode") discountCode?: string,
  ) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>(
            "CART_HTTP_SERVICE_URL",
          )}/cart/total`,
          {
            headers: { Authorization: token },
            params: {
              discountCode,
            },
          },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Cart")
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard)
  @Post("cart/checkout")
  async checkout(@Token() token: string, @Body() checkoutDto: CheckoutDto) {
    try {
      return this.httpService
        .post(
          `${this.configService.get<string>(
            "CART_HTTP_SERVICE_URL",
          )}/cart/checkout`,
          checkoutDto,
          { headers: { Authorization: token } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }

  @ApiTags("Order")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get("order")
  async findMany(@Token() token: string) {
    try {
      return this.httpService
        .get(
          `${this.configService.get<string>("ORDER_HTTP_SERVICE_URL")}/order`,
          { headers: { Authorization: token } },
        )
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        );
    } catch (error) {
      throw error;
    }
  }
}
