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
import { CityService } from './city.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { City } from '@modules/city/city.entity';
import { CreateCityDto } from '@modules/city/dto/create-city.dto';
import { UpdateCityDto } from '@modules/city/dto/update-city.dto';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';
import { CityImportExportService } from './city-import-export.service';

@Controller('city')
export class CityController {
  constructor(
    private readonly cityService: CityService,
    private readonly cityImportExportService: CityImportExportService,
  ) {}

  @Get('/')
  async getAllCities(): Promise<City[]> {
    return this.cityService.findAll();
  }

  @Get('/details/:cityId')
  async getOneCity(@Param('cityId') cityId: string): Promise<City> {
    return await this.cityService.findOneByID(cityId);
  }

  @UseGuards(AuthGuard)
  @Get('/export')
  async exportCities(
    @Query('ids') ids: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const csv = await this.cityImportExportService.exportToCsv(
      parseExportIds(ids),
    );

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${buildExportFilename('cities.csv')}"`,
    );
    response.send(csv);
  }

  @UseGuards(AuthGuard)
  @Post('/import/preview')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  async previewImportCities(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ImportPreviewResult> {
    return this.cityImportExportService.preview(requireImportFile(file));
  }

  @UseGuards(AuthGuard)
  @Post('/import/confirm')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  async confirmImportCities(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: { user: any },
  ): Promise<ImportConfirmResult> {
    return this.cityImportExportService.confirm(
      requireImportFile(file),
      request.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCity(
    @Body() createCityDto: CreateCityDto,
    @Req() req: { user: any },
  ): Promise<City> {
    return await this.cityService.createCity(createCityDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/:cityId')
  async updateCity(
    @Param('cityId') cityId: string,
    @Body() updateCityDto: UpdateCityDto,
    @Req() req: { user: any },
  ): Promise<City> {
    return await this.cityService.updateCity(cityId, updateCityDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete('/:cityId')
  async removeCity(
    @Param('cityId') cityId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.cityService.removeCity(cityId, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeCities(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.cityService.removeCities(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateCities(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.cityService.bulkActivateCities(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateCities(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.cityService.bulkDeactivateCities(
      bulkIdsDto.ids,
      req.user,
    );
  }
}
