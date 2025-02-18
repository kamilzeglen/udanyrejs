import { Injectable } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Email } from './email.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    private readonly mailerService: MailerService,
    private readonly logService: LogService,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<Email> {
    const { name, email, offerURL, message } = sendEmailDto;

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

    const emailEntity = this.emailRepository.create({
      name,
      email,
      message,
      offerURL,
    });

    await this.logService.createLog('Wysłano E-Mail: ' + email, 'SYSTEM');

    return await this.emailRepository.save(emailEntity);
  }
}
