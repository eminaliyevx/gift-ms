import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Test } from "@nestjs/testing";
import { Role } from "@prisma/client";
import { BusinessController } from "../src/business.controller";

describe("BusinessController", () => {
  let businessController: BusinessController;

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
            name: "auth",
            useFactory: (configService: ConfigService) => ({
              transport: Transport.TCP,
              options: {
                host: "0.0.0.0",
                port: configService.get("AUTH_TCP_SERVICE_PORT"),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      controllers: [BusinessController],
      providers: [ConfigService, PrismaService],
    }).compile();

    businessController = moduleRef.get<BusinessController>(BusinessController);
  });

  describe("register", () => {
    it("should register business", async () => {
      const user = await businessController.register({
        email: "business@test.com",
        phone: "557777777",
        password: "qwerty123",
        role: Role.BUSINESS,
        name: "NestJS",
      });

      expect(user.role).toEqual(Role.BUSINESS);
    });
  });
});
