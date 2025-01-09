import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Company} from "./company.entity";
import {CreateCompanyDto} from "@modules/company/dto/create-offer.dto";
import {ImageFileService} from "@modules/image-file/image-file.service";
import {SaveTypes, UpdateTypes} from "../../interfaces/save-update-file-types";
import {UpdateCompanyDto} from "@modules/company/dto/update-offer.dto";
import {User} from "@modules/user/user.entity";
import {UserService} from "@modules/user/user.service";

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly imageFileService: ImageFileService,
    private readonly userService: UserService,
  ) {
  }

  findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findOne(id: string): Promise<any> {
    return this.companyRepository.findOneBy({id});
  }

  findOneByID(id: string): Promise<Company> {
    return this.companyRepository.findOneBy({ id });
  }

  async createOffer(
    createCompanyDto: CreateCompanyDto,
    reqCreatedBy: User,
    imageFile: Express.Multer.File,
  ): Promise<Company> {

    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const company = this.companyRepository.create({...createCompanyDto, createdBy});

    const savedCompany = await this.companyRepository.save(company);

    if (imageFile) {
      savedCompany.imageFile = await this.imageFileService.saveImage(imageFile, SaveTypes.COMPANY, savedCompany);
    }

    return this.companyRepository.save(savedCompany);
  }

  async updateOffer(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    reqCreatedBy: User,
    imageFile: Express.Multer.File | null,
  ): Promise<Company> {

    const existingCompany = await this.companyRepository.findOne({
      where: {id},
    });

    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(existingCompany, {
      ...updateCompanyDto,
      updatedBy
    });

    if (imageFile) {
      existingCompany.imageFile = await this.imageFileService.updateImage(imageFile, UpdateTypes.COMPANY, existingCompany);
    }

    // Zapisz zmiany w bazie danych
    return this.companyRepository.save(existingCompany);
  }

  async removeCompany(companyID: string): Promise<boolean> {
    const company = await this.companyRepository.findOne({
      where: {id: companyID},
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
