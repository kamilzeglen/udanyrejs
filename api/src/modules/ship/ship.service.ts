import {Injectable, NotFoundException} from '@nestjs/common';
import {Ship} from "@modules/ship/ship.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {SaveTypes, UpdateTypes} from "../../interfaces/save-update-file-types";
import {CreateShipDto} from "@modules/ship/dto/create-ship.dto";
import {ImageFileService} from "@modules/image-file/image-file.service";
import {UpdateShipDto} from "@modules/ship/dto/update-ship.dto";
import {User} from "@modules/user/user.entity";
import {UserService} from "@modules/user/user.service";

@Injectable()
export class ShipService {

  constructor(
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
    ) {
  }

  async findOne(id: string): Promise<any> {
    return this.shipRepository.findOneBy({id});
  }

  findOneByID(id: string): Promise<Ship> {
    return this.shipRepository.findOneBy({ id });
  }

  async findShipsByCompany(companyId: string): Promise<Ship[]> {
    return this.shipRepository.find({
      where: {company: {id: companyId}},
      relations: ['company'],
    });
  }

  async createShip(
    createShipDto: CreateShipDto,
    reqCreatedBy: User,
    imageFile: Express.Multer.File,
  ): Promise<Ship> {

    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const ship: Ship = this.shipRepository.create({...createShipDto, createdBy});

    const savedShip = await this.shipRepository.save(ship);

    if (imageFile) {
      savedShip.imageFile = await this.imageFileService.createFile(imageFile, SaveTypes.SHIP, savedShip);
    }

    return this.shipRepository.save(savedShip);
  }

  async updateShip(
    id: string,
    updateShipDto: UpdateShipDto,
    reqCreatedBy: User,
    imageFile: Express.Multer.File | null,
  ): Promise<Ship> {

    const existingShip = await this.shipRepository.findOne({
      where: {id},
    });

    if (!existingShip) {
      throw new NotFoundException(`Ship with ID ${id} not found`);
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(existingShip, {
      ...updateShipDto,
      updatedBy
    });

    if (imageFile) {
      existingShip.imageFile = await this.imageFileService.updateImage(imageFile, UpdateTypes.SHIP, existingShip);
    }

    return this.shipRepository.save(existingShip);
  }


  async removeShip(shipId: string): Promise<boolean> {
    const ship = await this.shipRepository.findOne({
      where: {id: shipId},
      relations: ['imageFile'],
    });

    if (!ship) {
      throw new Error('Ship not found');
    }

    if (ship.imageFile) {
      await this.imageFileService.removeImageFile(ship.imageFile.path);
    }

    await this.shipRepository.delete(shipId);

    return true;
  }
}
