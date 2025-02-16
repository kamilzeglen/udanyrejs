import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { CreateCompanyDto } from '@modules/company/dto/create-company.dto';
import { UpdateCompanyDto } from '@modules/company/dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find({
      where: {
        isActive: true,
      },
    });
  }

  async findOne(id: string): Promise<any> {
    return this.companyRepository.findOneBy({ id });
  }

  async findOneById(id: string): Promise<Company> {
    return await this.companyRepository.findOneBy({ id });
  }

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    reqCreatedBy: User,
  ): Promise<Company> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const company = this.companyRepository.create({
      ...createCompanyDto,
      createdBy,
    });

    return await this.companyRepository.save(company);
  }

  async updateCompany(
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

    await this.companyRepository.delete(company.id);

    return true;
  }
}
