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
import { CompanyService } from './company.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { Company } from '@modules/company/company.entity';
import { UpdateCompanyDto } from '@modules/company/dto/update-company.dto';
import { CreateCompanyDto } from '@modules/company/dto/create-company.dto';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('/')
  async getAllCompanies(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get('/details/:companyID')
  async getCompany(@Param('companyID') companyID: string): Promise<any[]> {
    return await this.companyService.findOne(companyID);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: { user: any },
  ): Promise<Company> {
    return await this.companyService.createCompany(createCompanyDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/:companyID')
  async updateCompany(
    @Param('companyID') companyID: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: { user: any },
  ): Promise<Company> {
    return await this.companyService.updateCompany(
      companyID,
      updateCompanyDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:companyID')
  async removeCompany(
    @Param('companyID') companyID: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.companyService.removeCompany(companyID, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeCompanies(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.companyService.removeCompanies(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateCompanies(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.companyService.bulkActivateCompanies(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateCompanies(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.companyService.bulkDeactivateCompanies(
      bulkIdsDto.ids,
      req.user,
    );
  }
}
