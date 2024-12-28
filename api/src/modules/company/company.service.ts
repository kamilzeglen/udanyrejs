import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Company} from "./company.entity";

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
  }

  getAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  findOneByID(id: string): Promise<Company> {
    return this.companyRepository.findOneBy({ id });
  }

}
