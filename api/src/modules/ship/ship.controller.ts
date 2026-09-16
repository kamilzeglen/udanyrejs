import { Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ShipImportExportService } from './ship-import-export.service';
import {
  zipUploadOptions,
  requireImportFile,
  parseExportIds,
} from '@core/import-export/import-upload.util';
import { buildExportFilename } from '@core/import-export/export-filename.util';
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
import { ShipService } from './ship.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { UpdateShipDto } from '@modules/ship/dto/update-ship.dto';
import { CreateShipDto } from '@modules/ship/dto/create-ship.dto';
import { Ship } from '@modules/ship/ship.entity';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';

@Controller('ship')
export class ShipController {
  @UseGuards(AuthGuard)
  @Get('/export')
  public async exportShip(
    @Query('ids') ids: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const buffer = await this.importExportService.exportToZip(
      parseExportIds(ids),
    );
    response.setHeader('Content-Type', 'application/zip');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${buildExportFilename('ships.zip')}"`,
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
    private readonly shipService: ShipService,
    private readonly importExportService: ShipImportExportService,
  ) {}

  @Get('/details/id/:shipId')
  async getOneOfferById(@Param('shipId') shipId: string): Promise<Ship> {
    return await this.shipService.findOneById(shipId);
  }
  @Get('/details/name/:shipName')
  async getOneOfferByName(@Param('shipName') shipName: string): Promise<Ship> {
    return await this.shipService.findOneByName(shipName);
  }

  @Get('/:companyId')
  async findShipsByCompany(@Param('companyId') companyId: string) {
    return this.shipService.findShipsByCompany(companyId);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createShip(
    @Body() createShipDto: CreateShipDto,
    @Req() req: { user: any },
  ): Promise<Ship> {
    return await this.shipService.createShip(createShipDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/:shipId')
  async updateShip(
    @Param('shipId') shipId: string,
    @Body() updateShipDto: UpdateShipDto,
    @Req() req: { user: any },
  ): Promise<Ship> {
    return await this.shipService.updateShip(shipId, updateShipDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete('/:shipId')
  async removeCompany(
    @Param('shipId') shipId: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.shipService.removeShip(shipId, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeShips(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.shipService.removeShips(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateShips(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.shipService.bulkActivateShips(bulkIdsDto.ids, req.user);
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateShips(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.shipService.bulkDeactivateShips(bulkIdsDto.ids, req.user);
  }
}
