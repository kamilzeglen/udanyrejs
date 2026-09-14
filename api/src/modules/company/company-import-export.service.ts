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
import { Company } from '@modules/company/company.entity';
import { CompanyService } from '@modules/company/company.service';
import { CreateCompanyDto } from '@modules/company/dto/create-company.dto';
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

interface ParsedCompanyRow {
  rowRef: string;
  id?: string;
  dto: CreateCompanyDto;
  isActive: boolean;
  imageEntry?: ZipEntry;
  result: ImportRowResult;
}

@Injectable()
export class CompanyImportExportService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly companyService: CompanyService,
    private readonly imageFileService: ImageFileService,
  ) {}

  public async exportToZip(ids?: string[]): Promise<Buffer> {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.imageFile', 'imageFile');

    if (ids !== undefined && ids.length > 0) {
      queryBuilder.where('company.id IN (:...ids)', { ids });
    }

    const companies = await queryBuilder.getMany();
    const files: { name: string; data: Buffer | string }[] = [];

    const csvRows = companies.map((company, index) => {
      let imageFileName = '';

      if (company.imageFile) {
        const extension = path.extname(company.imageFile.path);
        imageFileName = `images/row-${index}${extension}`;
        files.push({
          name: imageFileName,
          data: readFileSync(company.imageFile.path),
        });
      }

      return {
        id: company.id,
        name: company.name,
        key: company.key,
        isActive: String(company.isActive),
        description: company.description ?? '',
        priceIncludes: (company.priceIncludes ?? []).join(';'),
        priceExcludes: (company.priceExcludes ?? []).join(';'),
        imageFileName,
      };
    });

    files.unshift({
      name: 'data.csv',
      data: stringifyCsv(csvRows, [
        'id',
        'name',
        'key',
        'isActive',
        'description',
        'priceIncludes',
        'priceExcludes',
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

  private async saveRow(row: ParsedCompanyRow, user: User): Promise<string> {
    if (row.result.action === 'update') {
      await this.companyService.updateCompany(row.id, row.dto, user);
      return row.id;
    }

    const created = await this.companyService.createCompany(row.dto, user);
    return created.id;
  }

  private async applyActiveState(
    companyId: string,
    isActive: boolean,
    user: User,
  ): Promise<void> {
    if (isActive) {
      assertActivationSucceeded(
        await this.companyService.bulkActivateCompanies([companyId], user),
      );
      return;
    }

    assertActivationSucceeded(
      await this.companyService.bulkDeactivateCompanies([companyId], user),
    );
  }

  private async attachImage(
    companyId: string,
    row: ParsedCompanyRow,
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
      companyId,
      ImageFileType.COMPANY,
      multerFile,
      user,
    );
  }

  private async parseAndValidate(
    zipBuffer: Buffer,
  ): Promise<ParsedCompanyRow[]> {
    const entries = readZip(zipBuffer);
    const rawRows = archiveCsvRows(entries);
    const parsedRows: ParsedCompanyRow[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      parsedRows.push(await this.parseRow(rawRows[index], index, entries));
    }

    return parsedRows;
  }

  private async parseRow(
    raw: Record<string, string>,
    index: number,
    entries: ZipEntry[],
  ): Promise<ParsedCompanyRow> {
    const rowRef = `row-${index}`;
    const name = raw.name?.trim();
    const key = raw.key?.trim();
    const errors: string[] = [];

    if (name === undefined || name === '') {
      errors.push('Brak nazwy');
    }
    if (key === undefined || key === '') {
      errors.push('Brak key');
    }

    const priceIncludes = this.splitSemicolonList(raw.priceIncludes);
    if (priceIncludes.length === 0) {
      errors.push('Brak priceIncludes');
    }

    const priceExcludes = this.splitSemicolonList(raw.priceExcludes);
    if (priceExcludes.length === 0) {
      errors.push('Brak priceExcludes');
    }

    const imageEntry = resolveArchiveImage(
      raw.imageFileName?.trim(),
      entries,
      errors,
    );
    const id = await resolveImportId(
      raw.id,
      (value) => this.companyService.findOneById(value),
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
        key,
        description: raw.description ?? '',
        priceIncludes,
        priceExcludes,
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

  private splitSemicolonList(value: string | undefined): string[] {
    return (value ?? '')
      .split(';')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private summarize(rows: ParsedCompanyRow[]): ImportPreviewResult {
    return {
      toCreate: rows.filter((row) => row.result.action === 'create').length,
      toUpdate: rows.filter((row) => row.result.action === 'update').length,
      errors: rows.filter((row) => row.result.action === 'error').length,
      rows: rows.map((row) => row.result),
    };
  }
}
