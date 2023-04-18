import { PrismaService } from "@app/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Test } from "@nestjs/testing";
import { Gender, Role } from "@prisma/client";
import { CustomerController } from "../src/customer.controller";

describe("CustomerController", () => {
  let customerController: CustomerController;

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
      controllers: [CustomerController],
      providers: [ConfigService, PrismaService],
    }).compile();

    customerController = moduleRef.get<CustomerController>(CustomerController);
  });

  describe("register", () => {
    it("should register customer", async () => {
      const user = await customerController.register({
        email: "customer@test.com",
        phone: "+994556666666",
        password: "qwerty123",
        role: Role.CUSTOMER,
        firstName: "Emin",
        lastName: "Aliyev",
        birthDate: "2002-06-23",
        gender: Gender.MALE,
      });

      expect(user.role).toEqual(Role.CUSTOMER);
    });
  });
});
