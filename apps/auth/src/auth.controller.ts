import {
  AccountWithoutPassword,
  CreateUserDto,
  GetUser,
  Roles,
  UpdateUserDto,
} from "@app/common";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { Role } from "@prisma/client";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("health")
  async health() {
    return "auth";
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(200)
  async login(@GetUser() user: AccountWithoutPassword) {
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("account")
  async getAccount(@GetUser() user: AccountWithoutPassword) {
    return this.authService.getAccount(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("image"))
  @Patch("account")
  async updateAccount(
    @GetUser() user: AccountWithoutPassword,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.authService.updateAccount(user.id, updateUserDto, image);
  }

  @EventPattern("send-confirmation-email")
  async sendConfirmationEmail(@Payload() id: number) {
    return this.authService.sendConfirmationEmail(id);
  }

  @Get("confirm")
  async confirmEmail(@Query("hash") hash: string) {
    return this.authService.confirmEmail(hash);
  }
}
