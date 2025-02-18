import { Global, Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from '@modules/log/log.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Log]), UserModule, AuthModule],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
