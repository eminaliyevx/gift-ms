import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: ISendMailOptions) {
    return this.mailerService
      .sendMail(options)
      .then((response) => response)
      .catch((error) => console.error(error));
  }
}
