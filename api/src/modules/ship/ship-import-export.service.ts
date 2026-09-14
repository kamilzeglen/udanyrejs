import {
  archiveCsvRows,
  resolveArchiveImage,
  resolveImportId,
  rowActiveState,
  assertActivationSucceeded,
} from '@core/import-export/archive-row.util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Ship } from '@modules/ship/ship.entity';
import { ShipService } from '@modules/ship/ship.service';
import { CompanyService } from '@modules/company/company.service';
import { CreateShipDto } from '@modules/ship/dto/create-ship.dto';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { ImageFileType } from '../../interfaces/save-update-file-types';
import { User } from '@modules/user/user.entity';
import { stringifyCsv } from '@core/import-export/csv.util';
import { buildZip, readZip, ZipEntry } from '@core/import-export/zip.util';
import {
  ImportConfirmResult,
  ImportPreviewResult,
  ImportRowResult,
} from '@core/import-export/import-row-result.interface';

const NUMERIC_FIELDS = [
  'yearBuilt',
  'length',
  'width',
  'tonnage',
  'passengersDecks',
  'passengers',
  'crew',
] as const;

interface ParsedShipRow {
  rowRef: string;
  id?: string;
  dto: CreateShipDto;
  isActive: boolean;
  imageEntry?: ZipEntry;
  result: ImportRowResult;
}

@Injectable()
export class ShipImportExportService {
  constructor(
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    private readonly shipService: ShipService,
    private readonly companyService: CompanyService,
    private readonly imageFileService: ImageFileService,
  ) {}

  public async exportToZip(ids?: string[]): Promise<Buffer> {
    const queryBuilder = this.shipRepository
      .createQueryBuilder('ship')
      .leftJoinAndSelect('ship.imageFile', 'imageFile')
      .leftJoinAndSelect('ship.company', 'company');

    if (ids !== undefined && ids.length > 0) {
      queryBuilder.where('ship.id IN (:...ids)', { ids });
    }

    const ships = await queryBuilder.getMany();
    const files: { name: string; data: Buffer | string }[] = [];

    const csvRows = ships.map((ship, index) => {
      let imageFileName = '';

      if (ship.imageFile) {
        const extension = path.extname(ship.imageFile.path);
        imageFileName = `images/row-${index}${extension}`;
        files.push({
          name: imageFileName,
          data: readFileSync(ship.imageFile.path),
        });
      }

      return {
        id: ship.id,
        name: ship.name,
        companyKey: ship.company?.key ?? '',
        isActive: String(ship.isActive),
        description: ship.description ?? '',
        yearBuilt: ship.yearBuilt,
        renovation: ship.renovation,
        speed: ship.speed,
        length: ship.length,
        width: ship.width,
        tonnage: ship.tonnage,
        passengersDecks: ship.passengersDecks,
        passengers: ship.passengers,
        crew: ship.crew,
        currency: ship.currency,
        imageFileName,
      };
    });

    files.unshift({
      name: 'data.csv',
      data: stringifyCsv(csvRows, [
        'id',
        'name',
        'companyKey',
        'isActive',
        'description',
        'yearBuilt',
        'renovation',
        'speed',
        'length',
        'width',
        'tonnage',
        'passengersDecks',
        'passengers',
        'crew',
        'currency',
        'imageFileName',
      ]),
    });

    return buildZip(files);
  }

  public async preview(zipBuffer: Buffer): Promise<ImportPreviewResult> {
    const rows = await this.parseAndValidate(zipBuffer);
    return this.summarize(rows);
  }

  public async confirm(
    zipBuffer: Buffer,
    user: User,
  ): Promise<ImportConfirmResult> {
    const rows = await this.parseAndValidate(zipBuffer);
    const confirmResult: ImportConfirmResult = {
      created: [],
      updated: [],
      failed: [],
    };

    for (const row of rows) {
      if (row.result.action === 'error') {
        confirmResult.failed.push({
          rowRef: row.rowRef,
          error: row.result.errors.join('; '),
        });
        continue;
      }

      try {
        const savedId = await this.saveRow(row, user);
        await this.applyActiveState(savedId, row.isActive, user);
        await this.attachImage(savedId, row, user);

        if (row.result.action === 'update') {
          confirmResult.updated.push(row.rowRef);
        } else {
          confirmResult.created.push(row.rowRef);
        }
      } catch (error) {
        confirmResult.failed.push({ rowRef: row.rowRef, error: error.message });
      }
    }

    return confirmResult;
  }

  private async saveRow(row: ParsedShipRow, user: User): Promise<string> {
    if (row.result.action === 'update') {
      await this.shipService.updateShip(row.id, row.dto, user);
      return row.id;
    }

    const created = await this.shipService.createShip(row.dto, user);
    return created.id;
  }

  private async applyActiveState(
    shipId: string,
    isActive: boolean,
    user: User,
  ): Promise<void> {
    if (isActive) {
      assertActivationSucceeded(
        await this.shipService.bulkActivateShips([shipId], user),
      );
      return;
    }

    assertActivationSucceeded(
      await this.shipService.bulkDeactivateShips([shipId], user),
    );
  }

  private async attachImage(
    shipId: string,
    row: ParsedShipRow,
    user: User,
  ): Promise<void> {
    if (row.imageEntry === undefined) {
      return;
    }

    const multerFile = {
      originalname: row.imageEntry.name,
      buffer: row.imageEntry.data,
      mimetype: 'application/octet-stream',
    } as Express.Multer.File;

    await this.imageFileService.updateImageFile(
      shipId,
      ImageFileType.SHIP,
      multerFile,
      user,
    );
  }

  private async parseAndValidate(zipBuffer: Buffer): Promise<ParsedShipRow[]> {
    const entries = readZip(zipBuffer);
    const rawRows = archiveCsvRows(entries);
    const parsedRows: ParsedShipRow[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      parsedRows.push(await this.parseRow(rawRows[index], index, entries));
    }

    return parsedRows;
  }

  private async parseRow(
    raw: Record<string, string>,
    index: number,
    entries: ZipEntry[],
  ): Promise<ParsedShipRow> {
    const rowRef = `row-${index}`;
    const name = raw.name?.trim();
    const companyKey = raw.companyKey?.trim();
    const description = raw.description?.trim();
    const currency = raw.currency?.trim();
    const errors: string[] = [];

    if (name === undefined || name === '') {
      errors.push('Brak nazwy');
    }
    if (companyKey === undefined || companyKey === '') {
      errors.push('Brak companyKey');
    }
    if (description === undefined || description === '') {
      errors.push('Brak opisu');
    }
    if (currency === undefined || currency === '') {
      errors.push('Brak waluty');
    }

    const numericValues: Record<string, number> = {};
    for (const field of NUMERIC_FIELDS) {
      numericValues[field] = this.parseRequiredNumber(raw, field, errors);
    }
    const renovation = this.parseOptionalNumber(raw, 'renovation', errors);
    const speed = this.parseOptionalNumber(raw, 'speed', errors);

    let companyId: string | undefined;

    if (companyKey) {
      const company = await this.companyService.findOneByKey(companyKey);

      if (company === null || company === undefined) {
        errors.push(`Nie znaleziono firmy o kluczu '${companyKey}'`);
      } else {
        companyId = company.id;
      }
    }

    const imageEntry = resolveArchiveImage(
      raw.imageFileName?.trim(),
      entries,
      errors,
    );
    const id = await resolveImportId(
      raw.id,
      (value) => this.shipService.findOneById(value),
      errors,
    );
    const isActive = rowActiveState(raw.isActive, errors);
    let action: ImportRowResult['action'] =
      id === undefined ? 'create' : 'update';
    if (errors.length > 0) {
      action = 'error';
    }

    return {
      rowRef,
      id,
      dto: {
        name,
        companyId,
        description,
        currency,
        yearBuilt: numericValues.yearBuilt,
        renovation,
        speed,
        length: numericValues.length,
        width: numericValues.width,
        tonnage: numericValues.tonnage,
        passengersDecks: numericValues.passengersDecks,
        passengers: numericValues.passengers,
        crew: numericValues.crew,
      },
      isActive,
      imageEntry,
      result: {
        rowRef,
        action,
        label: name || `(wiersz ${index + 1})`,
        errors,
      },
    };
  }

  private parseRequiredNumber(
    raw: Record<string, string>,
    field: string,
    errors: string[],
  ): number {
    const value = raw[field]?.trim();
    const parsed = value ? Number(value) : NaN;

    if (
      value === undefined ||
      value === '' ||
      Number.isFinite(parsed) === false
    ) {
      errors.push(`Brak lub nieprawidłowe pole '${field}'`);
    }

    return parsed;
  }

  private parseOptionalNumber(
    raw: Record<string, string>,
    field: string,
    errors: string[],
  ): number | undefined {
    const value = raw[field]?.trim();

    if (value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }

    errors.push(`Nieprawidłowe pole '${field}'`);
    return undefined;
  }

  private summarize(rows: ParsedShipRow[]): ImportPreviewResult {
    return {
      toCreate: rows.filter((row) => row.result.action === 'create').length,
      toUpdate: rows.filter((row) => row.result.action === 'update').length,
      errors: rows.filter((row) => row.result.action === 'error').length,
      rows: rows.map((row) => row.result),
    };
  }
}
