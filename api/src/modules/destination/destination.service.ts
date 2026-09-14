import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destination } from '@modules/destination/destination.entity';
import { User } from '@modules/user/user.entity';
import { CreateDestinationDto } from '@modules/destination/dto/create-destination.dto';
import { UserService } from '@modules/user/user.service';
import { UpdateDestinationDto } from '@modules/destination/dto/update-destination.dto';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class DestinationService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Destination[]> {
    return await this.destinationRepository
      .createQueryBuilder('destination')
      .loadRelationCountAndMap('destination.offerCount', 'destination.offers')
      .getMany();
  }

  async findOneByID(id: string): Promise<Destination> {
    return await this.destinationRepository
      .createQueryBuilder('destination')
      .where('destination.id = :id', { id })
      .getOne();
  }

  async findOneByName(name: string): Promise<Destination | null> {
    const destinations = await this.destinationRepository
      .createQueryBuilder('destination')
      .where('LOWER(destination.name) = LOWER(:name)', { name })
      .take(2)
      .getMany();

    if (destinations.length > 1) {
      throw new AppException(API_ERRORS.IMPORT_REFERENCE_AMBIGUOUS, { name });
    }

    return destinations[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<Destination[]> {
    return await this.destinationRepository
      .createQueryBuilder('destination')
      .where('destination.id IN (:...ids)', { ids })
      .getMany();
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

    await this.logService.createLog(
      'Dodano region: ' + destination.name,
      reqCreatedBy.email,
    );

    return await this.saveOrThrowOnDuplicateName(destination);
  }

  async updateDestination(
    id: string,
    updateDestinationDto: UpdateDestinationDto,
    reqCreatedBy: User,
  ): Promise<Destination> {
    const destination = await this.destinationRepository
      .createQueryBuilder('destination')
      .where('destination.id = :id', { id })
      .getOne();

    if (!destination) {
      throw new AppException(API_ERRORS.DESTINATION_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(destination, {
      ...updateDestinationDto,
      updatedBy,
    });

    await this.logService.createLog(
      'Zaktualizowano region: ' +
        destination.name +
        ' (' +
        destination.id +
        ')',
      reqCreatedBy.email,
    );

    return this.saveOrThrowOnDuplicateName(destination);
  }

  async removeDestination(
    destinationId: string,
    reqCreatedBy: User,
  ): Promise<boolean> {
    const destination = await this.destinationRepository
      .createQueryBuilder('destination')
      .where('destination.id = :destinationId', { destinationId })
      .getOne();

    if (!destination) {
      throw new AppException(API_ERRORS.DESTINATION_NOT_FOUND, {
        id: destinationId,
      });
    }

    await this.logService.createLog(
      'Usunięto region: ' + destination.name + ' (' + destination.id + ')',
      reqCreatedBy.email,
    );

    await this.destinationRepository
      .createQueryBuilder()
      .delete()
      .from(Destination)
      .where('id = :destinationId', { destinationId })
      .execute();

    return true;
  }

  async removeDestinations(
    destinationIds: string[],
    reqCreatedBy: User,
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    for (const destinationId of destinationIds) {
      try {
        await this.removeDestination(destinationId, reqCreatedBy);
        deletedIds.push(destinationId);
      } catch {
        failedIds.push(destinationId);
      }
    }

    return { deletedIds, failedIds };
  }

  async bulkActivateDestinations(
    destinationIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(destinationIds, true, reqCreatedBy);
  }

  async bulkDeactivateDestinations(
    destinationIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(destinationIds, false, reqCreatedBy);
  }

  private async bulkSetActive(
    destinationIds: string[],
    isActive: boolean,
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    const existingDestinations = await this.destinationRepository
      .createQueryBuilder('destination')
      .select('destination.id')
      .where('destination.id IN (:...destinationIds)', { destinationIds })
      .getMany();

    const existingIds = existingDestinations.map(
      (destination) => destination.id,
    );
    const failedIds = destinationIds.filter(
      (destinationId) => !existingIds.includes(destinationId),
    );

    if (existingIds.length === 0) {
      return { updatedIds: [], failedIds };
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    await this.destinationRepository
      .createQueryBuilder()
      .update(Destination)
      .set({ isActive, updatedBy })
      .where('id IN (:...existingIds)', { existingIds })
      .execute();

    await this.logService.createLog(
      (isActive ? 'Aktywowano' : 'Dezaktywowano') +
        ' kierunki (' +
        existingIds.length +
        '): ' +
        existingIds.join(', '),
      reqCreatedBy.email,
    );

    return { updatedIds: existingIds, failedIds };
  }

  private async saveOrThrowOnDuplicateName(
    destination: Destination,
  ): Promise<Destination> {
    try {
      return await this.destinationRepository.save(destination);
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') {
        throw new AppException(API_ERRORS.DESTINATION_NAME_DUPLICATE, {
          name: destination.name,
        });
      }

      throw error;
    }
  }
}
