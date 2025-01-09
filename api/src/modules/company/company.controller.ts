import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {CompanyService} from './company.service';
import {AuthGuard} from "@modules/auth/guards/auth.guard";
import {AnyFilesInterceptor} from "@nestjs/platform-express";
import {CreateCompanyDto} from "@modules/company/dto/create-offer.dto";
import {Company} from "@modules/company/company.entity";
import {UpdateCompanyDto} from "@modules/company/dto/update-offer.dto";

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {
  }

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
  @UseInterceptors(AnyFilesInterceptor())
  async createCompany(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: { user: any },
  ): Promise<Company> {
    const imageFile = files.find((file) => file.fieldname === 'image');

    return await this.companyService.createOffer(createCompanyDto, req.user, imageFile);
  }

  @UseGuards(AuthGuard)
  @Post('/:companyID')
  @UseInterceptors(AnyFilesInterceptor())
  async updateCompany(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('companyID') companyID: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() req: { user: any },
  ): Promise<Company> {
    const imageFile = files.find((file) => file.fieldname === 'image');

    return await this.companyService.updateOffer(companyID, updateCompanyDto, req.user, imageFile);
  }

  @UseGuards(AuthGuard)
  @Delete('/:companyID')
  async removeCompany(@Param('companyID') companyID: string): Promise<boolean> {
    return await this.companyService.removeCompany(companyID);
  }
}
