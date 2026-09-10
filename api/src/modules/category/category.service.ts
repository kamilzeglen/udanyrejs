import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '@modules/category/category.entity';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { CreateCategoryDto } from '@modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@modules/category/dto/update-category.dto';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.offerCount', 'category.offers')
      .orderBy('category.position', 'ASC')
      .getMany();
  }

  async findOneByID(id: string): Promise<Category> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id = :id', { id })
      .getOne();
  }

  async findOneByName(name: string): Promise<Category> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name = :name', { name })
      .getOne();
  }

  async findOneByUrl(url: string): Promise<Category> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.url = :url', { url })
      .getOne();
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id IN (:...ids)', { ids })
      .getMany();
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    reqCreatedBy: User,
  ): Promise<Category> {
    const createdBy = await this.userService.findOneByEmail(reqCreatedBy.email);
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      createdBy,
    });

    await this.logService.createLog(
      'Dodano kategorię: ' + category.name,
      reqCreatedBy.email,
    );

    return await this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    reqCreatedBy: User,
  ): Promise<Category> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id = :id', { id })
      .getOne();

    if (!category) {
      throw new AppException(API_ERRORS.CATEGORY_NOT_FOUND, { id });
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(category, {
      ...updateCategoryDto,
      updatedBy,
    });

    await this.logService.createLog(
      'Zaktualizowano kategorie: ' + category.name + ' (' + category.id + ')',
      reqCreatedBy.email,
    );

    return this.categoryRepository.save(category);
  }

  async removeCategory(
    categoryId: string,
    reqCreatedBy: User,
  ): Promise<boolean> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id = :categoryId', { categoryId })
      .getOne();

    if (!category) {
      throw new AppException(API_ERRORS.CATEGORY_NOT_FOUND, { id: categoryId });
    }

    await this.logService.createLog(
      'Usunięto kategorie: ' + category.name + ' (' + category.id + ')',
      reqCreatedBy.email,
    );

    await this.categoryRepository
      .createQueryBuilder()
      .delete()
      .from(Category)
      .where('id = :categoryId', { categoryId })
      .execute();

    return true;
  }
}
