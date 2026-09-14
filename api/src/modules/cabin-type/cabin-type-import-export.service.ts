import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { isUUID, validateSync } from 'class-validator';
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
import { assertActivationSucceeded } from '@core/import-export/archive-row.util';
import { CompanyService } from '@modules/company/company.service';
import { User } from '@modules/user/user.entity';
import { CabinType } from './cabin-type.entity';
import { CabinTypeService } from './cabin-type.service';
import { CreateCabinTypeDto } from './dto/create-cabin-type.dto';

interface ParsedCabinTypeRow {
  rowRef: string;
  id?: string;
  dto: CreateCabinTypeDto;
  isActive: boolean;
  result: ImportRowResult;
}

@Injectable()
export class CabinTypeImportExportService {
  constructor(
    @InjectRepository(CabinType)
    private readonly cabinTypeRepository: Repository<CabinType>,
    private readonly cabinTypeService: CabinTypeService,
    private readonly companyService: CompanyService,
  ) {}

  async exportToCsv(ids?: string[]): Promise<string> {
    const queryBuilder = this.cabinTypeRepository
      .createQueryBuilder('cabinType')
      .leftJoinAndSelect('cabinType.company', 'company');

    if (ids?.length) {
      queryBuilder.where('cabinType.id IN (:...ids)', { ids });
    }

    const cabinTypes = await queryBuilder.getMany();
    const rows = cabinTypes.map((cabinType) => ({
      id: cabinType.id,
      name: cabinType.name,
      companyKey: cabinType.company?.key ?? '',
      isActive: String(cabinType.isActive),
    }));

    return stringifyCsv(rows, ['id', 'name', 'companyKey', 'isActive']);
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
        const savedId = await this.saveRow(row, user);
        await this.applyActiveState(savedId, row.isActive, user);

        if (row.result.action === 'update') {
          result.updated.push(row.rowRef);
          continue;
        }

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

  private async saveRow(row: ParsedCabinTypeRow, user: User): Promise<string> {
    if (row.result.action === 'update') {
      await this.cabinTypeService.updateCabinType(row.id, row.dto, user);

      return row.id;
    }

    const created = await this.cabinTypeService.createCabinType(row.dto, user);

    return created.id;
  }

  private async applyActiveState(
    cabinTypeId: string,
    isActive: boolean,
    user: User,
  ): Promise<void> {
    if (isActive) {
      assertActivationSucceeded(
        await this.cabinTypeService.bulkActivateCabinTypes([cabinTypeId], user),
      );
      return;
    }

    assertActivationSucceeded(
      await this.cabinTypeService.bulkDeactivateCabinTypes([cabinTypeId], user),
    );
  }

  private async parseAndValidate(
    buffer: Buffer,
  ): Promise<ParsedCabinTypeRow[]> {
    const rawRows = parseCsv(buffer);
    const rows: ParsedCabinTypeRow[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      rows.push(await this.parseRow(rawRows[index], index));
    }

    return rows;
  }

  private async parseRow(
    raw: Record<string, string>,
    index: number,
  ): Promise<ParsedCabinTypeRow> {
    const rowRef = `row-${index}`;
    const name = raw.name?.trim() ?? '';
    const companyKey = raw.companyKey?.trim() ?? '';
    const errors: string[] = [];

    if (name.length === 0) {
      errors.push('Brak nazwy');
    }

    const companyId = await this.resolveCompanyId(companyKey, errors);
    const id = await this.resolveId(raw.id, errors);
    let action: ImportRowResult['action'] = id ? 'update' : 'create';
    const isActive = this.parseBoolean(raw.isActive, 'isActive', true, errors);
    const dto = plainToInstance(CreateCabinTypeDto, {
      name,
      companyId: companyId ?? '',
    });

    this.appendDtoErrors(dto, errors);

    if (errors.length > 0) {
      action = 'error';
    }

    return {
      rowRef,
      id,
      dto,
      isActive,
      result: {
        rowRef,
        action,
        label: name || `(wiersz ${index + 1})`,
        errors,
      },
    };
  }

  private async resolveCompanyId(
    companyKey: string,
    errors: string[],
  ): Promise<string | undefined> {
    if (companyKey.length === 0) {
      errors.push('Brak companyKey');
      return undefined;
    }

    const company = await this.companyService.findOneByKey(companyKey);

    if (company === null || company === undefined) {
      errors.push(`Nie znaleziono firmy o kluczu '${companyKey}'`);
      return undefined;
    }

    return company.id;
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

    const existing = await this.cabinTypeService.findOneById(id);

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

  private appendDtoErrors(dto: CreateCabinTypeDto, errors: string[]): void {
    if (errors.length > 0) {
      return;
    }

    for (const validationError of validateSync(dto)) {
      errors.push(`Nieprawidłowa wartość ${validationError.property}`);
    }
  }

  private summarize(rows: ParsedCabinTypeRow[]): ImportPreviewResult {
    return {
      toCreate: rows.filter((row) => row.result.action === 'create').length,
      toUpdate: rows.filter((row) => row.result.action === 'update').length,
      errors: rows.filter((row) => row.result.action === 'error').length,
      rows: rows.map((row) => row.result),
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
