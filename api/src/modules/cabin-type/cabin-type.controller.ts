import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  csvUploadOptions,
  parseExportIds,
  requireImportFile,
} from '@core/import-export/import-upload.util';
import { buildExportFilename } from '@core/import-export/export-filename.util';
import {
  ImportConfirmResult,
  ImportPreviewResult,
} from '@core/import-export/import-row-result.interface';
import {
  CabinTypeService,
  CabinTypeWithOffersCount,
} from './cabin-type.service';
import { CabinType } from './cabin-type.entity';
import { AuthGuard } from '@core/guards/auth.guard';
import { CreateCabinTypeDto } from './dto/create-cabin-type.dto';
import { UpdateCabinTypeDto } from './dto/update-cabin-type.dto';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';
import { CabinTypeImportExportService } from './cabin-type-import-export.service';

@Controller('cabin-type')
export class CabinTypeController {
  constructor(
    private readonly cabinTypeService: CabinTypeService,
    private readonly cabinTypeImportExportService: CabinTypeImportExportService,
  ) {}

  @Get('/details/:cabinTypeId')
  async getOneCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
  ): Promise<CabinType> {
    return await this.cabinTypeService.findOneById(cabinTypeId);
  }

  @Get('/')
  async getAllCabinTypes(): Promise<CabinTypeWithOffersCount[]> {
    return await this.cabinTypeService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/export')
  async exportCabinTypes(
    @Query('ids') ids: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const csv = await this.cabinTypeImportExportService.exportToCsv(
      parseExportIds(ids),
    );

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${buildExportFilename('cabin-types.csv')}"`,
    );
    response.send(csv);
  }

  @Get('/:companyId')
  async getCabinTypesByCompany(
    @Param('companyId') companyId: string,
  ): Promise<CabinType[]> {
    return await this.cabinTypeService.findAllByCompany(companyId);
  }

  @UseGuards(AuthGuard)
  @Post('/import/preview')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  async previewImportCabinTypes(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ImportPreviewResult> {
    return this.cabinTypeImportExportService.preview(requireImportFile(file));
  }

  @UseGuards(AuthGuard)
  @Post('/import/confirm')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  async confirmImportCabinTypes(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: { user: any },
  ): Promise<ImportConfirmResult> {
    return this.cabinTypeImportExportService.confirm(
      requireImportFile(file),
      request.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCabinType(
    @Body() createCabinTypeDto: CreateCabinTypeDto,
    @Req() req: { user: any },
  ): Promise<CabinType> {
    return await this.cabinTypeService.createCabinType(
      createCabinTypeDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:cabinTypeId')
  async updateCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
    @Body() updateCabinTypeDto: UpdateCabinTypeDto,
    @Req() req: { user: any },
  ): Promise<CabinType> {
    return await this.cabinTypeService.updateCabinType(
      cabinTypeId,
      updateCabinTypeDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:cabinTypeId')
  async removeCabinType(
    @Param('cabinTypeId') cabinTypeId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.cabinTypeService.removeCabinType(cabinTypeId, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeCabinTypes(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.cabinTypeService.removeCabinTypes(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateCabinTypes(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.cabinTypeService.bulkActivateCabinTypes(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateCabinTypes(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.cabinTypeService.bulkDeactivateCabinTypes(
      bulkIdsDto.ids,
      req.user,
    );
  }
}
