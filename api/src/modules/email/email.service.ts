import { Injectable } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Email } from './email.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    private readonly mailerService: MailerService,
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

    return await this.emailRepository.save(emailEntity);
  }
}
