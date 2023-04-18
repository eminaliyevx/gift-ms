import { PrismaService, S3Service } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Test } from "@nestjs/testing";
import { Gender, Role, Status, User } from "@prisma/client";
import { AuthService } from "../src/auth.service";
import { UserService } from "../src/user/user.service";

describe("AuthService", () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let userService: UserService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: "./.env.test",
        }),
        HttpModule,
        JwtModule.register({
          secret: "JWT_SECRET",
          signOptions: { expiresIn: "7d" },
        }),
        ClientsModule.registerAsync([
          {
            name: "mail",
            useFactory: (configService: ConfigService) => ({
              transport: Transport.TCP,
              options: {
                host: "0.0.0.0",
                port: configService.get("MAIL_TCP_SERVICE_PORT"),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [
        ConfigService,
        AuthService,
        PrismaService,
        UserService,
        S3Service,
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    userService = moduleRef.get<UserService>(UserService);

    user = await prismaService.user.create({
      data: {
        id: 1331,
        email: "ealiyev12125@ada.edu.az",
        phone: "+994504206878",
        password:
          "$2b$13$ubiqOq1yu/gHj9vufJgTfeNPLIrTLozxs64hnZOyT196AUyqf8L8C",
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
  });

  describe("validateUser", () => {
    it("should return user with undefined password given valid credentials", async () => {
      userService.findUnique = jest.fn().mockReturnValue({
        email: "kibrahimli7825@ada.edu.az",
        password:
          "$2b$13$sP4JN2BTLSI7qZsPDWNDAOyBnXvfUbmTIkiYb4IHnAnTiPoLrl1Q2",
      });

      const result = await authService.validateUser(
        "kibrahimli7825@ada.edu.az",
        "kenan123",
      );

      expect(result).toBeDefined();
      expect((result as any).password).toBeUndefined();
    });

    it("should return null given invalid credentials", async () => {
      userService.findUnique = jest.fn().mockReturnValue({
        email: "kibrahimli7825@ada.edu.az",
        password:
          "$2b$13$sP4JN2BTLSI7qZsPDWNDAOyBnXvfUbmTIkiYb4IHnAnTiPoLrl1Q2",
      });

      const result = await authService.validateUser(
        "kibrahimli7825@ada.edu.az",
        "kanan123",
      );

      expect(result).toBeNull();
    });
  });

  describe("register", () => {
    it("should register user", async () => {
      const user = await authService.register({
        email: "auth@test.com",
        phone: "+994555555555",
        password: "qwerty123",
        role: Role.CUSTOMER,
      });

      expect(user.role).toEqual(Role.CUSTOMER);
    });
  });

  describe("login", () => {
    it("should return user and accessToken given a user payload", async () => {
      const user = {
        id: 7825,
        email: "kibrahimli7825@ada.edu.az",
        phone: "+994702496971",
        role: Role.CUSTOMER,
        confirmed: true,
        status: Status.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {
          firstName: "Kanan",
          lastName: "Ibrahimli",
          birthDate: new Date(2001, 10, 2),
          gender: Gender.MALE,
          userId: 7825,
        },
        business: null,
        image: null,
      };

      const result = await authService.login(user);

      expect(result.accessToken).toBeDefined();
    });
  });

  describe("confirmEmail", () => {
    it("should confirm email given a valid access token", async () => {
      delete user.password;
      user.confirmed = true;

      const accessToken = jwtService.sign(user);
      const hash = Buffer.from(accessToken, "utf8").toString("hex");
      const result = await authService.confirmEmail(hash);

      expect(result.accessToken).toBeDefined();
    });
  });
});
