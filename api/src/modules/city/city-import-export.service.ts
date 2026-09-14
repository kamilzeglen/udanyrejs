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
import { AppException } from '@core/errors/app-exception';
import { DestinationService } from '@modules/destination/destination.service';
import { Destination } from '@modules/destination/destination.entity';
import { User } from '@modules/user/user.entity';
import { City } from './city.entity';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';

interface ParsedCityRow {
  rowRef: string;
  id?: string;
  dto: CreateCityDto;
  isActive: boolean;
  result: ImportRowResult;
}

@Injectable()
export class CityImportExportService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly cityService: CityService,
    private readonly destinationService: DestinationService,
  ) {}

  async exportToCsv(ids?: string[]): Promise<string> {
    const queryBuilder = this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.destinations', 'destinations');

    if (ids?.length) {
      queryBuilder.where('city.id IN (:...ids)', { ids });
    }

    const cities = await queryBuilder.getMany();
    const rows = cities.map((city) => ({
      id: city.id,
      name: city.name,
      isActive: String(city.isActive),
      destinationNames: (city.destinations ?? [])
        .map((destination) => destination.name)
        .join(';'),
    }));

    return stringifyCsv(rows, ['id', 'name', 'isActive', 'destinationNames']);
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

  private async saveRow(row: ParsedCityRow, user: User): Promise<string> {
    if (row.result.action === 'update') {
      await this.cityService.updateCity(row.id, row.dto, user);

      return row.id;
    }

    const created = await this.cityService.createCity(row.dto, user);

    return created.id;
  }

  private async applyActiveState(
    cityId: string,
    isActive: boolean,
    user: User,
  ): Promise<void> {
    if (isActive) {
      assertActivationSucceeded(
        await this.cityService.bulkActivateCities([cityId], user),
      );
      return;
    }

    assertActivationSucceeded(
      await this.cityService.bulkDeactivateCities([cityId], user),
    );
  }

  private async parseAndValidate(buffer: Buffer): Promise<ParsedCityRow[]> {
    const rawRows = parseCsv(buffer);
    const rows: ParsedCityRow[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      rows.push(await this.parseRow(rawRows[index], index));
    }

    return rows;
  }

  private async parseRow(
    raw: Record<string, string>,
    index: number,
  ): Promise<ParsedCityRow> {
    const rowRef = `row-${index}`;
    const name = raw.name?.trim() ?? '';
    const errors: string[] = [];

    if (name.length === 0) {
      errors.push('Brak nazwy');
    }

    const destinationIds = await this.resolveDestinationIds(
      raw.destinationNames,
      errors,
    );
    const id = await this.resolveId(raw.id, errors);
    let action: ImportRowResult['action'] = id ? 'update' : 'create';
    const isActive = this.parseBoolean(raw.isActive, 'isActive', true, errors);
    const dto = plainToInstance(CreateCityDto, {
      name,
      destinations: destinationIds,
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

  private async resolveDestinationIds(
    rawNames: string | undefined,
    errors: string[],
  ): Promise<string[]> {
    const names = (rawNames ?? '')
      .split(';')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const ids: string[] = [];

    for (const name of names) {
      let destination: Destination | null;

      try {
        destination = await this.destinationService.findOneByName(name);
      } catch (error) {
        if (
          error instanceof AppException &&
          error.key === 'IMPORT_REFERENCE_AMBIGUOUS'
        ) {
          errors.push(`Niejednoznaczne odwołanie '${name}'`);
          continue;
        }

        throw error;
      }

      if (destination === null || destination === undefined) {
        errors.push(`Nie znaleziono kierunku '${name}'`);
        continue;
      }

      if (ids.includes(destination.id) === false) {
        ids.push(destination.id);
      }
    }

    return ids;
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

    const existing = await this.cityService.findOneByID(id);

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

  private appendDtoErrors(dto: CreateCityDto, errors: string[]): void {
    if (errors.length > 0) {
      return;
    }

    for (const validationError of validateSync(dto)) {
      errors.push(`Nieprawidłowa wartość ${validationError.property}`);
    }
  }

  private summarize(rows: ParsedCityRow[]): ImportPreviewResult {
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
