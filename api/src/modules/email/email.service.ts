import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Email } from './email.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    private readonly mailerService: MailerService,
    private readonly logService: LogService,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<Email> {
    const { name, email, offerURL, message } = sendEmailDto;

    try {
      if (!offerURL) {
        await this.mailerService.sendMail({
          to: 'kontakt@udanyrejs.pl',
          subject: 'Nowa wiadomość z formularza kontaktowego',
          template: './contact',
          context: {
            name,
            email,
            message,
          },
        });
      } else {
        await this.mailerService.sendMail({
          to: 'kontakt@udanyrejs.pl',
          subject: 'Nowa wiadomość z formularza kontaktowego',
          template: './contactWithOffer',
          context: {
            name,
            email,
            message,
            offerURL,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to send contact e-mail from ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }

    const emailEntity = this.emailRepository.create({
      name,
      email,
      message,
      offerURL,
    });

    await this.logService.createLog('Wysłano E-Mail: ' + email, 'SYSTEM');
    this.logger.log(`Sent contact e-mail from ${email}`);

    return await this.emailRepository.save(emailEntity);
  }
}
