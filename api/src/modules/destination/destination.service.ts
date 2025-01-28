import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {Destination} from "@modules/destination/destination.entity";

@Injectable()
export class DestinationService {

  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
  ) {
  }

  async findAll(): Promise<Destination[]> {
    return await this.destinationRepository.find();
  }

  findOneByID(id: string): Promise<Destination> {
    return this.destinationRepository.findOneBy({id});
  }

  async findByIds(ids: string[]): Promise<Destination[]> {
    return this.destinationRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

}
