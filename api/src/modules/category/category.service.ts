import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '@modules/category/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  findOneByID(id: string): Promise<Category> {
    return this.categoryRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Category> {
    return this.categoryRepository.findOneBy({ name });
  }

  findOneByUrl(url: string): Promise<Category> {
    return this.categoryRepository.findOneBy({ url });
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        id: In(ids),
      },
    });
  }
}
