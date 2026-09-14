import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Ship } from '@modules/ship/ship.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShipDto } from '@modules/ship/dto/create-ship.dto';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UpdateShipDto } from '@modules/ship/dto/update-ship.dto';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class ShipService {
  public async findOneByNameAndCompany(
    name: string,
    companyId: string,
  ): Promise<Ship | null> {
    const ships = await this.shipRepository
      .createQueryBuilder('ship')
      .where('LOWER(ship.name) = LOWER(:name)', { name })
      .andWhere('ship.companyId = :companyId', { companyId })
      .take(2)
      .getMany();
    if (ships.length > 1) {
      throw new AppException(API_ERRORS.IMPORT_REFERENCE_AMBIGUOUS, { name });
    }
    return ships[0] ?? null;
  }

  private async saveOrThrowOnDuplicateName(ship: Ship): Promise<Ship> {
    try {
      return await this.shipRepository.save(ship);
    } catch (error) {
      if (error?.code === '23505') {
        throw new AppException(API_ERRORS.SHIP_NAME_DUPLICATE, {
          name: ship.name,
          companyId: ship.companyId,
        });
      }
      throw error;
    }
  }

  constructor(
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  findOneById(id: string): Promise<Ship> {
    return this.shipRepository
      .createQueryBuilder('ship')
      .where('ship.id = :id', { id })
      .getOne();
  }

  findOneByName(name: string): Promise<Ship> {
    return this.shipRepository
      .createQueryBuilder('ship')
      .where('ship.name = :name', { name })
      .getOne();
  }

  async findShipsByCompany(companyId: string): Promise<Ship[]> {
    return this.shipRepository
      .createQueryBuilder('ship')
      .leftJoinAndSelect('ship.company', 'company')
      .where('company.id = :companyId', { companyId })
      .getMany();
  }

  async createShip(
    createShipDto: CreateShipDto,
    reqCreatedBy: User,
  ): Promise<Ship> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const ship: Ship = this.shipRepository.create({
      ...createShipDto,
      createdBy,
    });

    await this.logService.createLog(
      'Dodano statek: ' + ship.name,
      reqCreatedBy.email,
    );

    return this.saveOrThrowOnDuplicateName(ship);
  }

  async updateShip(
    id: string,
    updateShipDto: UpdateShipDto,
    reqCreatedBy: User,
  ): Promise<Ship> {
    const ship = await this.shipRepository
      .createQueryBuilder('ship')
      .where('ship.id = :id', { id })
      .getOne();

    if (!ship) {
      throw new AppException(API_ERRORS.SHIP_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(ship, {
      ...updateShipDto,
      updatedBy,
    });

    await this.logService.createLog(
      'Zaktualizowano statek: ' + ship.name + ' (' + ship.id + ')',
      reqCreatedBy.email,
    );

    return this.saveOrThrowOnDuplicateName(ship);
  }

  async removeShip(shipId: string, reqCreatedBy: User): Promise<boolean> {
    const ship = await this.shipRepository
      .createQueryBuilder('ship')
      .leftJoinAndSelect('ship.imageFile', 'imageFile')
      .where('ship.id = :shipId', { shipId })
      .getOne();

    if (!ship) {
      throw new AppException(API_ERRORS.SHIP_NOT_FOUND, { id: shipId });
    }

    if (ship.imageFile) {
      await this.imageFileService.removeImageFile(ship.imageFile.path);
    }

    await this.logService.createLog(
      'Usunięto statek: ' + ship.name + ' (' + ship.id + ')',
      reqCreatedBy.email,
    );

    await this.shipRepository
      .createQueryBuilder()
      .delete()
      .from(Ship)
      .where('id = :shipId', { shipId })
      .execute();

    return true;
  }

  async removeShips(
    shipIds: string[],
    reqCreatedBy: User,
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    for (const shipId of shipIds) {
      try {
        await this.removeShip(shipId, reqCreatedBy);
        deletedIds.push(shipId);
      } catch {
        failedIds.push(shipId);
      }
    }

    return { deletedIds, failedIds };
  }

  async bulkActivateShips(
    shipIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(shipIds, true, reqCreatedBy);
  }

  async bulkDeactivateShips(
    shipIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(shipIds, false, reqCreatedBy);
  }

  private async bulkSetActive(
    shipIds: string[],
    isActive: boolean,
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    const existingShips = await this.shipRepository
      .createQueryBuilder('ship')
      .select('ship.id')
      .where('ship.id IN (:...shipIds)', { shipIds })
      .getMany();

    const existingIds = existingShips.map((ship) => ship.id);
    const failedIds = shipIds.filter((shipId) => !existingIds.includes(shipId));

    if (existingIds.length === 0) {
      return { updatedIds: [], failedIds };
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    await this.shipRepository
      .createQueryBuilder()
      .update(Ship)
      .set({ isActive, updatedBy })
      .where('id IN (:...existingIds)', { existingIds })
      .execute();

    await this.logService.createLog(
      (isActive ? 'Aktywowano' : 'Dezaktywowano') +
        ' statki (' +
        existingIds.length +
        '): ' +
        existingIds.join(', '),
      reqCreatedBy.email,
    );

    return { updatedIds: existingIds, failedIds };
  }
}
