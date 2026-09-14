import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { CreateCompanyDto } from '@modules/company/dto/create-company.dto';
import { UpdateCompanyDto } from '@modules/company/dto/update-company.dto';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class CompanyService {
  public async findOneByKey(key: string): Promise<Company | null> {
    return this.companyRepository
      .createQueryBuilder('company')
      .where('company.key = :key', { key })
      .getOne();
  }

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
      throw new AppException(API_ERRORS.COMPANY_NOT_FOUND, { id });
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
      throw new AppException(API_ERRORS.COMPANY_NOT_FOUND, { id: companyID });
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

  async removeCompanies(
    companyIds: string[],
    reqCreatedBy: User,
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    for (const companyId of companyIds) {
      try {
        await this.removeCompany(companyId, reqCreatedBy);
        deletedIds.push(companyId);
      } catch {
        failedIds.push(companyId);
      }
    }

    return { deletedIds, failedIds };
  }

  async bulkActivateCompanies(
    companyIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(companyIds, true, reqCreatedBy);
  }

  async bulkDeactivateCompanies(
    companyIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(companyIds, false, reqCreatedBy);
  }

  private async bulkSetActive(
    companyIds: string[],
    isActive: boolean,
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    const existingCompanies = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.id')
      .where('company.id IN (:...companyIds)', { companyIds })
      .getMany();

    const existingIds = existingCompanies.map((company) => company.id);
    const failedIds = companyIds.filter(
      (companyId) => !existingIds.includes(companyId),
    );

    if (existingIds.length === 0) {
      return { updatedIds: [], failedIds };
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    await this.companyRepository
      .createQueryBuilder()
      .update(Company)
      .set({ isActive, updatedBy })
      .where('id IN (:...existingIds)', { existingIds })
      .execute();

    await this.logService.createLog(
      (isActive ? 'Aktywowano' : 'Dezaktywowano') +
        ' armatorów (' +
        existingIds.length +
        '): ' +
        existingIds.join(', '),
      reqCreatedBy.email,
    );

    return { updatedIds: existingIds, failedIds };
  }
}
