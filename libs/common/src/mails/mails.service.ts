import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, LoggerService } from '@nestjs/common';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MailErrorHandler } from './handlers';

@Injectable()
export class MailsService {
  constructor(
    private mailerService: MailerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async sendEmail(
    emailTo: string,
    subject: string,
    template: string,
    context: object,
  ) {
    try {
      return await this.mailerService.sendMail({
        to: emailTo,
        subject: subject,
        template: template,
        context: context,
      });
    } catch (error) {
      MailErrorHandler(error);
      this.logger.error(
        'Calling sendUserConfirmation()',
        error.stack,
        MailsService.name,
      );
    }
  }
}
