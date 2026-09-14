import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { isISO8601, isUUID, validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import {
  parseBooleanColumn,
  parseCsv,
  stringifyCsv,
} from '@core/import-export/csv.util';
import {
  ImportConfirmResult,
  ImportPreviewResult,
  ImportRowResult,
} from '@core/import-export/import-row-result.interface';
import { User } from '@modules/user/user.entity';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

interface ParsedCategoryRow {
  rowRef: string;
  id?: string;
  dto: CreateCategoryDto;
  result: ImportRowResult;
}

@Injectable()
export class CategoryImportExportService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoryService: CategoryService,
  ) {}

  async exportToCsv(ids?: string[]): Promise<string> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (ids?.length) {
      queryBuilder.where('category.id IN (:...ids)', { ids });
    }

    const categories = await queryBuilder.getMany();
    const rows = categories.map((category) => ({
      id: category.id,
      name: category.name,
      url: category.url,
      position: category.position,
      startDate: this.formatDate(category.startDate),
      endDate: this.formatDate(category.endDate),
      isActive: String(category.isActive),
      isVisible: String(category.isVisible),
    }));

    return stringifyCsv(rows, [
      'id',
      'name',
      'url',
      'position',
      'startDate',
      'endDate',
      'isActive',
      'isVisible',
    ]);
  }

  async preview(buffer: Buffer): Promise<ImportPreviewResult> {
    const rows = await this.parseAndValidate(buffer);

    return this.summarize(rows);
  }

  async confirm(buffer: Buffer, user: User): Promise<ImportConfirmResult> {
    const rows = await this.parseAndValidate(buffer);
    const result: ImportConfirmResult = {
      created: [],
      updated: [],
      failed: [],
    };

    for (const row of rows) {
      if (row.result.action === 'error') {
        result.failed.push({
          rowRef: row.rowRef,
          error: row.result.errors.join('; '),
        });
        continue;
      }

      try {
        if (row.result.action === 'update') {
          await this.categoryService.updateCategory(row.id, row.dto, user);
          result.updated.push(row.rowRef);
          continue;
        }

        await this.categoryService.createCategory(row.dto, user);
        result.created.push(row.rowRef);
      } catch (error) {
        result.failed.push({
          rowRef: row.rowRef,
          error: this.getErrorMessage(error),
        });
      }
    }

    return result;
  }

  private async parseAndValidate(buffer: Buffer): Promise<ParsedCategoryRow[]> {
    const rawRows = parseCsv(buffer);
    const rows: ParsedCategoryRow[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      rows.push(await this.parseRow(rawRows[index], index));
    }

    return rows;
  }

  private async parseRow(
    raw: Record<string, string>,
    index: number,
  ): Promise<ParsedCategoryRow> {
    const rowRef = `row-${index}`;
    const name = raw.name?.trim() ?? '';
    const url = raw.url?.trim() ?? '';
    const positionRaw = raw.position?.trim() ?? '';
    const position = Number(positionRaw);
    const startDate = raw.startDate?.trim() ?? '';
    const endDate = raw.endDate?.trim() ?? '';
    const errors: string[] = [];

    if (name.length === 0) {
      errors.push('Brak nazwy');
    }

    if (url.length === 0) {
      errors.push('Brak url');
    }

    if (positionRaw.length === 0 || Number.isFinite(position) === false) {
      errors.push('Brak lub nieprawidłowa pozycja');
    }

    this.validateDate(startDate, 'początkowej', 'początkowa', errors);
    this.validateDate(endDate, 'końcowej', 'końcowa', errors);

    const id = await this.resolveId(raw.id, errors);
    let action: ImportRowResult['action'] = id ? 'update' : 'create';
    const isActive = this.parseBoolean(raw.isActive, 'isActive', true, errors);
    const isVisible = this.parseBoolean(
      raw.isVisible,
      'isVisible',
      true,
      errors,
    );
    const dto = plainToInstance(CreateCategoryDto, {
      name,
      url,
      position,
      startDate: startDate as unknown as Date,
      endDate: endDate as unknown as Date,
      isActive,
      isVisible,
    });

    this.appendDtoErrors(dto, errors);

    if (errors.length > 0) {
      action = 'error';
    }

    return {
      rowRef,
      id,
      dto,
      result: {
        rowRef,
        action,
        label: name || `(wiersz ${index + 1})`,
        errors,
      },
    };
  }

  private validateDate(
    value: string,
    missingLabel: string,
    invalidLabel: string,
    errors: string[],
  ): void {
    if (value.length === 0) {
      errors.push(`Brak daty ${missingLabel}`);
      return;
    }

    if (isISO8601(value, { strict: true }) === false) {
      errors.push(`Nieprawidłowa data ${invalidLabel}`);
    }
  }

  private async resolveId(
    rawId: string | undefined,
    errors: string[],
  ): Promise<string | undefined> {
    const id = rawId?.trim();

    if (id === undefined || id.length === 0) {
      return undefined;
    }

    if (isUUID(id) === false) {
      errors.push('Nieprawidłowe id');
      return undefined;
    }

    const existing = await this.categoryService.findOneByID(id);

    if (existing === null || existing === undefined) {
      errors.push('Rekord o podanym id nie istnieje');
      return undefined;
    }

    return existing.id;
  }

  private parseBoolean(
    value: string | undefined,
    fieldName: string,
    defaultValue: boolean,
    errors: string[],
  ): boolean {
    try {
      return parseBooleanColumn(value, defaultValue);
    } catch {
      errors.push(`Nieprawidłowa wartość ${fieldName}`);

      return defaultValue;
    }
  }

  private appendDtoErrors(dto: CreateCategoryDto, errors: string[]): void {
    if (errors.length > 0) {
      return;
    }

    for (const validationError of validateSync(dto)) {
      errors.push(`Nieprawidłowa wartość ${validationError.property}`);
    }
  }

  private summarize(rows: ParsedCategoryRow[]): ImportPreviewResult {
    return {
      toCreate: rows.filter((row) => row.result.action === 'create').length,
      toUpdate: rows.filter((row) => row.result.action === 'update').length,
      errors: rows.filter((row) => row.result.action === 'error').length,
      rows: rows.map((row) => row.result),
    };
  }

  private formatDate(value: Date | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (typeof value === 'string') {
      return value.slice(0, 10);
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
