import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from '@modules/company/dto/create-offer.dto';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { UpdateCompanyDto } from '@modules/company/dto/update-offer.dto';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      where: {
        isActive: true,
      },
    });
  }

  async findOne(id: string): Promise<any> {
    return this.companyRepository.findOneBy({ id });
  }

  findOneById(id: string): Promise<Company> {
    return this.companyRepository.findOneBy({ id });
  }

  async createOffer(
    createCompanyDto: CreateCompanyDto,
    reqCreatedBy: User,
  ): Promise<Company> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const company = this.companyRepository.create({
      ...createCompanyDto,
      createdBy,
    });

    const savedCompany = await this.companyRepository.save(company);

    return this.companyRepository.save(savedCompany);
  }

  async updateOffer(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    reqCreatedBy: User,
  ): Promise<Company> {
    const existingCompany = await this.companyRepository.findOne({
      where: { id },
    });

    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(existingCompany, {
      ...updateCompanyDto,
      updatedBy,
    });

    return this.companyRepository.save(existingCompany);
  }

  async removeCompany(companyID: string): Promise<boolean> {
    const company = await this.companyRepository.findOne({
      where: { id: companyID },
      relations: ['imageFile'],
    });

    if (!company) {
      throw new Error('Company not found');
    }

    if (company.imageFile) {
      await this.imageFileService.removeImageFile(company.imageFile.path);
    }

    await this.companyRepository.delete(companyID);

    return true;
  }
}
