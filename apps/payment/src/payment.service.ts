import { AccountWithoutPassword, PaymentDto } from "@app/common";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
  private readonly stripe = new Stripe(
    this.configService.get("STRIPE_SECRET_KEY"),
    {
      apiVersion: "2022-11-15",
    },
  );

  constructor(
    private readonly configService: ConfigService,
    @Inject("mail") private readonly mailService: ClientProxy,
  ) {}

  async chargeCustomer(user: AccountWithoutPassword, paymentDto: PaymentDto) {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: "card",
      card: {
        number: paymentDto.number,
        exp_month: paymentDto.exp_month,
        exp_year: paymentDto.exp_year,
        cvc: paymentDto.cvc,
      },
      billing_details: {
        name: user.customer.firstName + " " + user.customer.lastName,
        email: user.email,
        phone: user.phone,
        address: {
          line1: paymentDto.location,
        },
      },
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method: paymentMethod.id,
      amount: paymentDto.amount,
      confirm: true,
      currency: "azn",
      metadata: {
        note: paymentDto.note,
      },
      shipping: {
        name: user.customer.firstName + " " + user.customer.lastName,
        phone: user.phone,
        address: {
          line1: paymentDto.location,
        },
      },
    });

    this.mailService.emit("send-mail", {
      from: "admin@eminaliyev.tech",
      to: user.email,
      subject: "Gift | Payment received",
      html: `<a href="http://159.223.250.148:3000/order/${paymentIntent.id}">Click on the link to view your order</a>`,
    });

    return paymentIntent;
  }
}
