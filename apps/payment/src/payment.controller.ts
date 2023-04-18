import { AccountWithoutPassword, PaymentDto } from "@app/common";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { PaymentService } from "./payment.service";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern("charge-customer")
  async chargeCustomer(
    @Payload()
    {
      user,
      paymentDto,
    }: {
      user: AccountWithoutPassword;
      paymentDto: PaymentDto;
    },
  ) {
    return this.paymentService.chargeCustomer(user, paymentDto);
  }
}
