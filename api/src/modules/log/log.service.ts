import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '@modules/log/log.entity';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name);

  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Log[]> {
    return await this.logRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  async createLog(
    message: string,
    createdByEmail: string | 'SYSTEM',
  ): Promise<void> {
    if (!createdByEmail) {
      throw new AppException(API_ERRORS.LOG_AUTHOR_MISSING);
    }

    let user: User;

    if (createdByEmail === 'SYSTEM') {
      user = await this.userService.findOneByEmail('system@udanyrejs.pl');
    } else {
      user = await this.userService.findOneByEmail(createdByEmail);
    }

    try {
      const log = this.logRepository.create({ message, createdBy: user });
      await this.logRepository.save(log);
    } catch (error) {
      this.logger.error(
        `Failed to persist audit log entry "${message}": ${error.message}`,
        error.stack,
      );
      throw new AppException(API_ERRORS.LOG_WRITE_FAILED);
    }
  }
}
