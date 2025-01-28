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
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { CreateCompanyDto } from '@modules/company/dto/create-offer.dto';
import { Company } from '@modules/company/company.entity';
import { UpdateCompanyDto } from '@modules/company/dto/update-offer.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('/')
  findAll() {
    return this.companyService.findAll();
  }

  @Get('/details/:companyID')
  async getOneOffer(@Param('companyID') companyID: string): Promise<any[]> {
    return await this.companyService.findOne(companyID);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: { user: any },
  ): Promise<Company> {
    return await this.companyService.createOffer(createCompanyDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/:companyID')
  async updateCompany(
    @Param('companyID') companyID: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: { user: any },
  ): Promise<Company> {
    return await this.companyService.updateOffer(
      companyID,
      updateCompanyDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:companyID')
  async removeCompany(@Param('companyID') companyID: string): Promise<boolean> {
    return await this.companyService.removeCompany(companyID);
  }
}
