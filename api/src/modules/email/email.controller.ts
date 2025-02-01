import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { Email } from '@modules/email/email.entity';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('/send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<Email> {
    return this.emailService.sendEmail(sendEmailDto);
  }
}
