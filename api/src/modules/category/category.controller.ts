import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '@modules/category/category.entity';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { UpdateCategoryDto } from '@modules/category/dto/update-category.dto';
import { CreateCategoryDto } from '@modules/category/dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get('/details/:categoryID')
  async getOneCategory(
    @Param('categoryID') categoryId: string,
  ): Promise<Category> {
    return await this.categoryService.findOneByID(categoryId);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCategory(
    @Body() createCompanyDto: CreateCategoryDto,
    @Req() req: { user: any },
  ): Promise<Category> {
    return await this.categoryService.createCategory(
      createCompanyDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:categoryID')
  async updateCompany(
    @Param('categoryID') categoryID: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: { user: any },
  ): Promise<Category> {
    return await this.categoryService.updateCategory(
      categoryID,
      updateCategoryDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:categoryID')
  async removeCompany(
    @Param('categoryID') categoryID: string,
  ): Promise<boolean> {
    return await this.categoryService.removeCategory(categoryID);
  }
}
