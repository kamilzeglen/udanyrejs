import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CabinType } from './cabin-type.entity';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { CreateCabinTypeDto } from './dto/create-cabin-type.dto';
import { UpdateCabinTypeDto } from './dto/update-cabin-type.dto';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class CabinTypeService {
  constructor(
    @InjectRepository(CabinType)
    private readonly cabinTypeRepository: Repository<CabinType>,
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  async findAllByCompany(companyId: string): Promise<CabinType[]> {
    return await this.cabinTypeRepository
      .createQueryBuilder('cabinType')
      .where('cabinType.companyId = :companyId', { companyId })
      .orderBy('cabinType.name', 'ASC')
      .getMany();
  }

  async findAll(): Promise<CabinType[]> {
    return await this.cabinTypeRepository
      .createQueryBuilder('cabinType')
      .leftJoinAndSelect('cabinType.company', 'company')
      .orderBy('company.name', 'ASC')
      .addOrderBy('cabinType.name', 'ASC')
      .getMany();
  }

  async findOneById(id: string): Promise<CabinType> {
    return await this.cabinTypeRepository
      .createQueryBuilder('cabinType')
      .where('cabinType.id = :id', { id })
      .getOne();
  }

  async findByIds(ids: string[]): Promise<CabinType[]> {
    if (!ids.length) {
      return [];
    }

    return await this.cabinTypeRepository
      .createQueryBuilder('cabinType')
      .where('cabinType.id IN (:...ids)', { ids })
      .getMany();
  }

  async createCabinType(
    createCabinTypeDto: CreateCabinTypeDto,
    reqCreatedBy: User,
  ): Promise<CabinType> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const cabinType = this.cabinTypeRepository.create({
      ...createCabinTypeDto,
      createdBy,
    });
    const saved = await this.cabinTypeRepository.save(cabinType);

    await this.logService.createLog(
      'Dodano rodzaj kabiny: ' + saved.name,
      reqCreatedBy.email,
    );

    return saved;
  }

  async updateCabinType(
    id: string,
    updateCabinTypeDto: UpdateCabinTypeDto,
    reqCreatedBy: User,
  ): Promise<CabinType> {
    const cabinType = await this.findOneById(id);

    if (!cabinType) {
      throw new AppException(API_ERRORS.CABIN_TYPE_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    Object.assign(cabinType, { ...updateCabinTypeDto, updatedBy });
    const saved = await this.cabinTypeRepository.save(cabinType);

    await this.logService.createLog(
      'Zaktualizowano rodzaj kabiny: ' + saved.name + ' (' + saved.id + ')',
      reqCreatedBy.email,
    );

    return saved;
  }

  async deactivateCabinType(id: string, reqCreatedBy: User): Promise<boolean> {
    const cabinType = await this.findOneById(id);

    if (!cabinType) {
      throw new AppException(API_ERRORS.CABIN_TYPE_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    cabinType.isActive = false;
    cabinType.updatedBy = updatedBy;
    await this.cabinTypeRepository.save(cabinType);

    await this.logService.createLog(
      'Dezaktywowano rodzaj kabiny: ' +
        cabinType.name +
        ' (' +
        cabinType.id +
        ')',
      reqCreatedBy.email,
    );

    return true;
  }

  async activateCabinType(id: string, reqCreatedBy: User): Promise<boolean> {
    const cabinType = await this.findOneById(id);

    if (!cabinType) {
      throw new AppException(API_ERRORS.CABIN_TYPE_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    cabinType.isActive = true;
    cabinType.updatedBy = updatedBy;
    await this.cabinTypeRepository.save(cabinType);

    await this.logService.createLog(
      'Aktywowano rodzaj kabiny: ' + cabinType.name + ' (' + cabinType.id + ')',
      reqCreatedBy.email,
    );

    return true;
  }
}
