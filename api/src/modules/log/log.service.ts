import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '@modules/log/log.entity';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Log[]> {
    return await this.logRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createLog(
    message: string,
    createdByEmail: string | 'SYSTEM',
  ): Promise<void> {
    if (!createdByEmail) {
      throw new Error('Brak użytkownika tworzącego log');
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
      throw new Error(`Błąd zapisu loga: ${error.message}`);
    }
  }
}
