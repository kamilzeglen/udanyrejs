import {Injectable, NotFoundException} from '@nestjs/common';
import {Ship} from "@modules/ship/ship.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CompanyService} from "@modules/company/company.service";

@Injectable()
export class ShipService {

  constructor(
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    private readonly companyService: CompanyService
    ) {
  }

  async createShip(companyId: string, name: string, code: string): Promise<Ship> {
    const company = await this.companyService.findOneByID(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const ship = this.shipRepository.create({name, companyId, company});
    return this.shipRepository.save(ship);
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

  async deleteShip(shipId: string): Promise<void> {
    const ship = await this.shipRepository.findOne({where: {id: shipId}});

    if (!ship) {
      throw new NotFoundException('Ship not found');
    }

    await this.shipRepository.remove(ship);
  }
}
