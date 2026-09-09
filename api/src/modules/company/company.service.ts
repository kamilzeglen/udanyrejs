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
import { LogService } from '@modules/log/log.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @Inject(forwardRef(() => ImageFileService))
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Company[]> {
    return await this.companyRepository
      .createQueryBuilder('company')
      .where('company.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findOne(id: string): Promise<any> {
    return this.companyRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id })
      .getOne();
  }

  async findOneById(id: string): Promise<Company> {
    return await this.companyRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id })
      .getOne();
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

    await this.logService.createLog(
      'Dodano armatora: ' + company.name,
      reqCreatedBy.email,
    );

    return await this.companyRepository.save(company);
  }

  async updateCompany(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    reqCreatedBy: User,
  ): Promise<Company> {
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id })
      .getOne();

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(company, {
      ...updateCompanyDto,
      updatedBy,
    });

    await this.logService.createLog(
      'Zaktualizowano armatora: ' + company.name + ' (' + company.id + ')',
      reqCreatedBy.email,
    );

    return this.companyRepository.save(company);
  }

  async removeCompany(companyID: string, reqCreatedBy: User): Promise<boolean> {
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.imageFile', 'imageFile')
      .where('company.id = :companyID', { companyID })
      .getOne();

    if (!company) {
      throw new Error('Company not found');
    }

    if (company.imageFile) {
      await this.imageFileService.removeImageFile(company.imageFile.path);
    }

    await this.logService.createLog(
      'Usunięto armatora: ' + company.name + ' (' + company.id + ')',
      reqCreatedBy.email,
    );

    await this.companyRepository
      .createQueryBuilder()
      .delete()
      .from(Company)
      .where('id = :companyID', { companyID })
      .execute();

    return true;
  }
}
