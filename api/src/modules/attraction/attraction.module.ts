import {Module} from '@nestjs/common';
import {AttractionService} from './attraction.service';
import {AttractionController} from './attraction.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Attraction} from "@modules/attraction/attraction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Attraction])],
  controllers: [AttractionController],
  providers: [AttractionService],
  exports: [AttractionService],
})
export class AttractionModule {
}
