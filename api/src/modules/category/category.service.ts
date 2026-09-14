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
    const { entities, raw } = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.terms', 'term')
      .addSelect('COUNT(DISTINCT term.offerId)', 'offerCount')
      .groupBy('category.id')
      .orderBy('category.position', 'ASC')
      .getRawAndEntities();

    return entities.map((category, index) => ({
      ...category,
      offerCount: Number(raw[index].offerCount),
    }));
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

    return await this.saveOrThrowOnDuplicateName(category);
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

    return this.saveOrThrowOnDuplicateName(category);
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

  async removeCategories(
    categoryIds: string[],
    reqCreatedBy: User,
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    for (const categoryId of categoryIds) {
      try {
        await this.removeCategory(categoryId, reqCreatedBy);
        deletedIds.push(categoryId);
      } catch {
        failedIds.push(categoryId);
      }
    }

    return { deletedIds, failedIds };
  }

  async bulkActivateCategories(
    categoryIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(categoryIds, true, reqCreatedBy);
  }

  async bulkDeactivateCategories(
    categoryIds: string[],
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return this.bulkSetActive(categoryIds, false, reqCreatedBy);
  }

  private async bulkSetActive(
    categoryIds: string[],
    isActive: boolean,
    reqCreatedBy: User,
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    const existingCategories = await this.categoryRepository
      .createQueryBuilder('category')
      .select('category.id')
      .where('category.id IN (:...categoryIds)', { categoryIds })
      .getMany();

    const existingIds = existingCategories.map((category) => category.id);
    const failedIds = categoryIds.filter(
      (categoryId) => !existingIds.includes(categoryId),
    );

    if (existingIds.length === 0) {
      return { updatedIds: [], failedIds };
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    await this.categoryRepository
      .createQueryBuilder()
      .update(Category)
      .set({ isActive, updatedBy })
      .where('id IN (:...existingIds)', { existingIds })
      .execute();

    await this.logService.createLog(
      (isActive ? 'Aktywowano' : 'Dezaktywowano') +
        ' kategorie (' +
        existingIds.length +
        '): ' +
        existingIds.join(', '),
      reqCreatedBy.email,
    );

    return { updatedIds: existingIds, failedIds };
  }

  private async saveOrThrowOnDuplicateName(
    category: Category,
  ): Promise<Category> {
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') {
        throw new AppException(API_ERRORS.CATEGORY_NAME_DUPLICATE, {
          name: category.name,
        });
      }

      throw error;
    }
  }
}
