import { Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CompanyImportExportService } from './company-import-export.service';
import {
  zipUploadOptions,
  requireImportFile,
  parseExportIds,
} from '@core/import-export/import-upload.util';
import {
  ImportConfirmResult,
  ImportPreviewResult,
} from '@core/import-export/import-row-result.interface';
import { User } from '@modules/user/user.entity';
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
  @UseGuards(AuthGuard)
  @Get('/export')
  public async exportCompany(
    @Query('ids') ids: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const buffer = await this.importExportService.exportToZip(
      parseExportIds(ids),
    );
    response.setHeader('Content-Type', 'application/zip');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="companies.zip"',
    );
    response.send(buffer);
  }

  @UseGuards(AuthGuard)
  @Post('/import/preview')
  @UseInterceptors(FileInterceptor('file', zipUploadOptions))
  public previewImport(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ImportPreviewResult> {
    return this.importExportService.preview(requireImportFile(file));
  }

  @UseGuards(AuthGuard)
  @Post('/import/confirm')
  @UseInterceptors(FileInterceptor('file', zipUploadOptions))
  public confirmImport(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: { user: User },
  ): Promise<ImportConfirmResult> {
    return this.importExportService.confirm(
      requireImportFile(file),
      request.user,
    );
  }

  constructor(
    private readonly companyService: CompanyService,
    private readonly importExportService: CompanyImportExportService,
  ) {}

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
