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

  async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    const { name, email, message } = sendEmailDto;

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

    const emailEntity = this.emailRepository.create({
      name,
      email,
      message,
    });
    await this.emailRepository.save(emailEntity);
  }
}
