import { ISendMailOptions } from "@nestjs-modules/mailer";
import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern("send-mail")
  async sendMail(@Payload() options: ISendMailOptions) {
    return this.mailService.sendMail(options);
  }
}
