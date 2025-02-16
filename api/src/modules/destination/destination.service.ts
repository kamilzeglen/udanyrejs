import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Destination } from '@modules/destination/destination.entity';
import { User } from '@modules/user/user.entity';
import { CreateDestinationDto } from '@modules/destination/dto/create-destination.dto';
import { UserService } from '@modules/user/user.service';
import { UpdateDestinationDto } from '@modules/destination/dto/update-destination.dto';

@Injectable()
export class DestinationService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Destination[]> {
    return await this.destinationRepository
      .createQueryBuilder('destination')
      .loadRelationCountAndMap('destination.offerCount', 'destination.offers')
      .getMany();
  }

  async findOneByID(id: string): Promise<Destination> {
    return await this.destinationRepository.findOneBy({ id });
  }

  async findByIds(ids: string[]): Promise<Destination[]> {
    return await this.destinationRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async createDestination(
    createDestinationDto: CreateDestinationDto,
    reqCreatedBy: User,
  ): Promise<Destination> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const destination = this.destinationRepository.create({
      ...createDestinationDto,
      createdBy,
    });

    return await this.destinationRepository.save(destination);
  }

  async updateDestination(
    id: string,
    updateDestinationDto: UpdateDestinationDto,
    reqCreatedBy: User,
  ): Promise<Destination> {
    const existingDestination = await this.destinationRepository.findOne({
      where: { id },
    });

    if (!existingDestination) {
      throw new NotFoundException(`Destination with ID ${id} not found`);
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(existingDestination, {
      ...updateDestinationDto,
      updatedBy,
    });

    return this.destinationRepository.save(existingDestination);
  }

  async removeDestination(destinationId: string): Promise<boolean> {
    const category = await this.destinationRepository.findOne({
      where: { id: destinationId },
    });

    if (!category) {
      throw new Error('Destination not found');
    }

    await this.destinationRepository.delete(category.id);

    return true;
  }
}
