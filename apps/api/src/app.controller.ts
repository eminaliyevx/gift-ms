import {
  AccountWithoutPassword,
  AuthGuard,
  CreateAttributeDto,
  CreateBusinessDto,
  CreateCategoryDto,
  CreateCustomerDto,
  CreateUserDto,
  GetUser,
  LoginUserDto,
  Roles,
  Token,
  UpdateAttributeDto,
  UpdateCategoryDto,
  UpdateUserDto,
} from "@app/common";
import { HttpService } from "@nestjs/axios";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
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
}
