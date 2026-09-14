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
import { AuthGuard } from '@core/guards/auth.guard';
import { UpdateCategoryDto } from '@modules/category/dto/update-category.dto';
import { CreateCategoryDto } from '@modules/category/dto/create-category.dto';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';

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
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.categoryService.removeCategory(categoryID, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeCategories(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.categoryService.removeCategories(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateCategories(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.categoryService.bulkActivateCategories(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateCategories(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.categoryService.bulkDeactivateCategories(
      bulkIdsDto.ids,
      req.user,
    );
  }
}
