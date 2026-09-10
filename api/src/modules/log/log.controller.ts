import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogService } from '@modules/log/log.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { Log } from '@modules/log/log.entity';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getAllLogs(): Promise<Log[]> {
    return this.logService.findAll();
  }
}
