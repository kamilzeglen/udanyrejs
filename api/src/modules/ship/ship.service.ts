import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Ship } from '@modules/ship/ship.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShipDto } from '@modules/ship/dto/create-ship.dto';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UpdateShipDto } from '@modules/ship/dto/update-ship.dto';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { LogService } from '@modules/log/log.service';

@Injectable()
export class ShipService {
  constructor(
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  findOneById(id: string): Promise<Ship> {
    return this.shipRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Ship> {
    return this.shipRepository.findOneBy({ name });
  }

  async findShipsByCompany(companyId: string): Promise<Ship[]> {
    return this.shipRepository.find({
      where: { company: { id: companyId } },
      relations: ['company'],
    });
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

    const savedShip = await this.shipRepository.save(ship);

    return this.shipRepository.save(savedShip);
  }

  async updateShip(
    id: string,
    updateShipDto: UpdateShipDto,
    reqCreatedBy: User,
  ): Promise<Ship> {
    const ship = await this.shipRepository.findOne({
      where: { id },
    });

    if (!ship) {
      throw new NotFoundException(`Ship with ID ${id} not found`);
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

    return this.shipRepository.save(ship);
  }

  async removeShip(shipId: string, reqCreatedBy: User): Promise<boolean> {
    const ship = await this.shipRepository.findOne({
      where: { id: shipId },
      relations: ['imageFile'],
    });

    if (!ship) {
      throw new Error('Ship not found');
    }

    if (ship.imageFile) {
      await this.imageFileService.removeImageFile(ship.imageFile.path);
    }

    await this.logService.createLog(
      'Usunięto statek: ' + ship.name + ' (' + ship.id + ')',
      reqCreatedBy.email,
    );

    await this.shipRepository.delete(shipId);

    return true;
  }
}
