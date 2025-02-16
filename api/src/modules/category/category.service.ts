import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '@modules/category/category.entity';
import { User } from '@modules/user/user.entity';
import { UserService } from '@modules/user/user.service';
import { CreateCategoryDto } from '@modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@modules/category/dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.offerCount', 'category.offers')
      .orderBy('category.position', 'ASC')
      .getMany();
  }

  async findOneByID(id: string): Promise<Category> {
    return await this.categoryRepository.findOneBy({ id });
  }

  async findOneByName(name: string): Promise<Category> {
    return await this.categoryRepository.findOneBy({ name });
  }

  async findOneByUrl(url: string): Promise<Category> {
    return await this.categoryRepository.findOneBy({ url });
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        id: In(ids),
      },
    });
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

    return await this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    reqCreatedBy: User,
  ): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updatedBy = await this.userService.findOneByEmail(reqCreatedBy.email);

    Object.assign(existingCategory, {
      ...updateCategoryDto,
      updatedBy,
    });

    return this.categoryRepository.save(existingCategory);
  }

  async removeCategory(categoryId: string): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    await this.categoryRepository.delete(category.id);

    return true;
  }
}
