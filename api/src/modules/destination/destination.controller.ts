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
import {
  ImportConfirmResult,
  ImportPreviewResult,
} from '@core/import-export/import-row-result.interface';
import { DestinationService } from './destination.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { Destination } from '@modules/destination/destination.entity';
import { CreateDestinationDto } from '@modules/destination/dto/create-destination.dto';
import { UpdateDestinationDto } from '@modules/destination/dto/update-destination.dto';
import { BulkIdsDto } from '@core/dto/bulk-ids.dto';
import { DestinationImportExportService } from './destination-import-export.service';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly destinationImportExportService: DestinationImportExportService,
  ) {}

  @Get('/')
  async getAllCategories(): Promise<Destination[]> {
    return this.destinationService.findAll();
  }

  @Get('/details/:destinationID')
  async getOneCategory(
    @Param('destinationID') destinationID: string,
  ): Promise<Destination> {
    return await this.destinationService.findOneByID(destinationID);
  }

  @UseGuards(AuthGuard)
  @Get('/export')
  async exportDestinations(
    @Query('ids') ids: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const csv = await this.destinationImportExportService.exportToCsv(
      parseExportIds(ids),
    );

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="destinations.csv"',
    );
    response.send(csv);
  }

  @UseGuards(AuthGuard)
  @Post('/import/preview')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  async previewImportDestinations(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ImportPreviewResult> {
    return this.destinationImportExportService.preview(requireImportFile(file));
  }

  @UseGuards(AuthGuard)
  @Post('/import/confirm')
  @UseInterceptors(FileInterceptor('file', csvUploadOptions))
  async confirmImportDestinations(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: { user: any },
  ): Promise<ImportConfirmResult> {
    return this.destinationImportExportService.confirm(
      requireImportFile(file),
      request.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createCategory(
    @Body() createDestinationDto: CreateDestinationDto,
    @Req() req: { user: any },
  ): Promise<Destination> {
    return await this.destinationService.createDestination(
      createDestinationDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:destinationID')
  async updateCompany(
    @Param('destinationID') destinationID: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
    @Req() req: { user: any },
  ): Promise<Destination> {
    return await this.destinationService.updateDestination(
      destinationID,
      updateDestinationDto,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:destinationID')
  async removeCompany(
    @Param('destinationID') destinationID: string,
    @Req() req: { user: any },
  ): Promise<boolean> {
    return await this.destinationService.removeDestination(
      destinationID,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-delete')
  async removeDestinations(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ deletedIds: string[]; failedIds: string[] }> {
    return await this.destinationService.removeDestinations(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-activate')
  async bulkActivateDestinations(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.destinationService.bulkActivateDestinations(
      bulkIdsDto.ids,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/bulk-deactivate')
  async bulkDeactivateDestinations(
    @Body() bulkIdsDto: BulkIdsDto,
    @Req() req: { user: any },
  ): Promise<{ updatedIds: string[]; failedIds: string[] }> {
    return await this.destinationService.bulkDeactivateDestinations(
      bulkIdsDto.ids,
      req.user,
    );
  }
}
