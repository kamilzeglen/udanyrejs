import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { isUUID, validate, ValidationError } from 'class-validator';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';
import {
  IMAGE_MAX_BYTES,
  PDF_MAX_BYTES,
  detectImageExtension,
  detectPdfExtension,
} from '@core/files/file-validation.util';
import {
  ImportConfirmResult,
  ImportPreviewResult,
  ImportRowResult,
} from '@core/import-export/import-row-result.interface';
import { buildZip, readZip, ZipEntry } from '@core/import-export/zip.util';
import { isSameDateRange } from '@core/utils/date-range.util';
import { Category } from '@modules/category/category.entity';
import { CompanyService } from '@modules/company/company.service';
import { Destination } from '@modules/destination/destination.entity';
import { ImageFileService } from '@modules/image-file/image-file.service';
import { PdfFileService } from '@modules/pdf-file/pdf-file.service';
import { ShipService } from '@modules/ship/ship.service';
import { User } from '@modules/user/user.entity';
import {
  ImageFileType,
  PdfFileType,
} from '../../interfaces/save-update-file-types';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ItineraryDayDto } from './dto/itinerary-day.dto';
import { OfferTermDto } from './dto/offer-term.dto';
import { Offer } from './offer.entity';
import { OfferService } from './offer.service';

interface OfferManifestPrice {
  cabinTypeName: string;
  priceGrosze: number;
}

interface OfferManifestTerm {
  startDate: string;
  endDate: string;
  sourceUrl?: string;
  isActive?: boolean;
  categoryNames?: string[];
  pdfFileName?: string;
  prices: OfferManifestPrice[];
}

interface OfferManifestEntry {
  id?: string;
  name: string;
  offerUrl?: string;
  syncData?: boolean;
  isRecommended?: boolean;
  companyKey: string;
  shipName: string;
  destinationNames?: string[];
  imageFileName?: string;
  itinerary?: ItineraryDayDto[];
  terms: OfferManifestTerm[];
}

interface ParsedOfferRow {
  rowRef: string;
  dto?: CreateOfferDto;
  isUpdate: boolean;
  offerId?: string;
  imageEntry?: ZipEntry;
  termPdfEntries: (ZipEntry | undefined)[];
  result: ImportRowResult;
}

interface ShapeValidationResult {
  entry?: OfferManifestEntry;
  errors: string[];
}

@Injectable()
export class OfferImportExportService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly offerService: OfferService,
    private readonly companyService: CompanyService,
    private readonly shipService: ShipService,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly imageFileService: ImageFileService,
    private readonly pdfFileService: PdfFileService,
  ) {}

  public async exportToZip(ids?: string[]): Promise<Buffer> {
    const offers = await this.findOffersForExport(ids);
    const files: { name: string; data: Buffer | string }[] = [];
    const manifest = offers.map((offer, index) =>
      this.serializeOffer(offer, index, files),
    );

    files.unshift({
      name: 'offers.json',
      data: JSON.stringify(manifest, null, 2),
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
    const result: ImportConfirmResult = {
      created: [],
      updated: [],
      failed: [],
    };

    for (const row of rows) {
      if (row.result.action === 'error' || row.dto === undefined) {
        result.failed.push({
          rowRef: row.rowRef,
          error: row.result.errors.join('; '),
        });
        continue;
      }

      try {
        const savedOffer = await this.saveOffer(row, user);
        await this.attachOfferImage(savedOffer.id, row, user);
        await this.attachTermPdfs(savedOffer, row, user);

        if (row.isUpdate) {
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

  private async findOffersForExport(ids?: string[]): Promise<Offer[]> {
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .leftJoinAndSelect('offer.ship', 'ship')
      .leftJoinAndSelect('offer.imageFile', 'imageFile')
      .leftJoinAndSelect('offer.destinations', 'destinations')
      .leftJoinAndSelect('offer.terms', 'terms')
      .leftJoinAndSelect('terms.pdfFile', 'pdfFile')
      .leftJoinAndSelect('terms.categories', 'categories')
      .leftJoinAndSelect('terms.prices', 'termPrices')
      .leftJoinAndSelect('termPrices.cabinType', 'cabinType');

    if (ids?.length) {
      queryBuilder.where('offer.id IN (:...ids)', { ids });
    }

    return queryBuilder.getMany();
  }

  private serializeOffer(
    offer: Offer,
    offerIndex: number,
    files: { name: string; data: Buffer | string }[],
  ): OfferManifestEntry {
    const imageFileName = this.appendImage(offer, offerIndex, files);
    const terms = (offer.terms ?? []).map((term, termIndex) => {
      const pdfFileName = this.appendTermPdf(
        term,
        offerIndex,
        termIndex,
        files,
      );

      return {
        startDate: this.toDateOnly(term.startDate),
        endDate: this.toDateOnly(term.endDate),
        sourceUrl: term.sourceUrl ?? undefined,
        isActive: term.isActive,
        categoryNames: (term.categories ?? []).map((category) => category.name),
        pdfFileName,
        prices: (term.prices ?? []).map((price) => ({
          cabinTypeName: price.cabinType?.name ?? '',
          priceGrosze: price.price,
        })),
      };
    });

    return {
      id: offer.id,
      name: offer.name,
      offerUrl: offer.offerUrl ?? undefined,
      syncData: offer.syncData,
      isRecommended: offer.isRecommended,
      companyKey: offer.company?.key ?? '',
      shipName: offer.ship?.name ?? '',
      destinationNames: (offer.destinations ?? []).map(
        (destination) => destination.name,
      ),
      imageFileName,
      itinerary: this.serializeItinerary(offer.itinerary),
      terms,
    };
  }

  private appendImage(
    offer: Offer,
    offerIndex: number,
    files: { name: string; data: Buffer | string }[],
  ): string | undefined {
    if (offer.imageFile === null || offer.imageFile === undefined) {
      return undefined;
    }

    const extension = path.extname(offer.imageFile.path);
    const fileName = `images/row-${offerIndex}${extension}`;
    files.push({ name: fileName, data: readFileSync(offer.imageFile.path) });
    return fileName;
  }

  private appendTermPdf(
    term: Offer['terms'][number],
    offerIndex: number,
    termIndex: number,
    files: { name: string; data: Buffer | string }[],
  ): string | undefined {
    if (term.pdfFile === null || term.pdfFile === undefined) {
      return undefined;
    }

    const fileName = `pdfs/row-${offerIndex}-term-${termIndex}.pdf`;
    files.push({ name: fileName, data: readFileSync(term.pdfFile.path) });
    return fileName;
  }

  private serializeItinerary(
    itinerary: Offer['itinerary'],
  ): ItineraryDayDto[] | undefined {
    if (itinerary === null || itinerary === undefined) {
      return undefined;
    }

    return itinerary.map((day) => ({
      day: day.day,
      date: day.date,
      city: day.city,
      arrivalTime: day.arrivalTime,
      departureTime: day.departureTime,
    }));
  }

  private toDateOnly(value: Date | string): string {
    if (typeof value === 'string') {
      return value.slice(0, 10);
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async parseAndValidate(zipBuffer: Buffer): Promise<ParsedOfferRow[]> {
    const entries = readZip(zipBuffer);
    const manifestEntries = entries.filter(
      (entry) => entry.name === 'offers.json',
    );

    if (manifestEntries.length !== 1) {
      throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
    }

    const manifest = this.parseManifest(manifestEntries[0]);
    const rows: ParsedOfferRow[] = [];

    for (let index = 0; index < manifest.length; index++) {
      rows.push(await this.parseEntry(manifest[index], index, entries));
    }

    return rows;
  }

  private parseManifest(entry: ZipEntry): unknown[] {
    let manifest: unknown;

    try {
      manifest = JSON.parse(entry.data.toString('utf-8'));
    } catch {
      throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
    }

    if (Array.isArray(manifest)) {
      return manifest;
    }

    throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
  }

  private async parseEntry(
    rawEntry: unknown,
    index: number,
    zipEntries: ZipEntry[],
  ): Promise<ParsedOfferRow> {
    const rowRef = `row-${index}`;
    const validation = this.validateShape(rawEntry);
    const label = this.readLabel(rawEntry, index);

    if (validation.entry === undefined) {
      return this.invalidRow(rowRef, label, validation.errors);
    }

    const entry = validation.entry;
    const errors = validation.errors;
    const companyId = await this.resolveCompanyId(entry.companyKey, errors);
    const shipId = await this.resolveShipId(entry.shipName, companyId, errors);
    const destinationIds =
      entry.destinationNames === undefined
        ? undefined
        : await this.resolveDestinationIds(entry.destinationNames, errors);
    const terms = await this.resolveTerms(entry.terms, zipEntries, errors);
    const imageEntry = this.resolveImageEntry(
      entry.imageFileName,
      zipEntries,
      errors,
    );
    const existing = await this.resolveExistingOffer(entry.id, errors);
    const dto = plainToInstance(CreateOfferDto, {
      name: entry.name,
      offerUrl: entry.offerUrl,
      syncData: entry.syncData,
      isRecommended: entry.isRecommended,
      companyId,
      shipId,
      destinations: destinationIds,
      terms: terms.dtos,
      itinerary: entry.itinerary,
    });

    if (errors.length === 0) {
      errors.push(...(await this.validateOfferDto(dto)));
    }

    const action = this.resolveAction(errors, existing.isUpdate);

    return {
      rowRef,
      dto,
      isUpdate: existing.isUpdate,
      offerId: existing.offerId,
      imageEntry,
      termPdfEntries: terms.pdfEntries,
      result: { rowRef, action, label: entry.name, errors },
    };
  }

  private validateShape(rawEntry: unknown): ShapeValidationResult {
    const errors: string[] = [];

    if (this.isRecord(rawEntry) === false) {
      return { errors: ['Nieprawidłowy wpis oferty'] };
    }

    this.validateRequiredText(rawEntry.name, 'Brak nazwy', errors);
    this.validateRequiredText(rawEntry.companyKey, 'Brak companyKey', errors);
    this.validateRequiredText(rawEntry.shipName, 'Brak shipName', errors);
    this.validateOptionalText(
      rawEntry.offerUrl,
      'Nieprawidłowe offerUrl',
      errors,
    );
    this.validateOptionalText(
      rawEntry.imageFileName,
      'Nieprawidłowe imageFileName',
      errors,
    );
    this.validateOptionalBoolean(
      rawEntry.syncData,
      'Nieprawidłowe syncData',
      errors,
    );
    this.validateOptionalBoolean(
      rawEntry.isRecommended,
      'Nieprawidłowe isRecommended',
      errors,
    );

    if (rawEntry.id !== undefined && isUUID(rawEntry.id as string) === false) {
      errors.push('Nieprawidłowe id oferty');
    }

    this.validateNamedArray(
      rawEntry.destinationNames,
      'Kierunek',
      errors,
      true,
    );
    this.validateItinerary(rawEntry.itinerary, errors);
    this.validateTerms(rawEntry.terms, errors);

    if (errors.length > 0) {
      return { errors };
    }

    return { entry: rawEntry as unknown as OfferManifestEntry, errors };
  }

  private validateTerms(value: unknown, errors: string[]): void {
    if (Array.isArray(value) === false) {
      errors.push('Brak terminów');
      return;
    }

    if (value.length === 0) {
      errors.push('Brak terminów');
      return;
    }

    const ranges = new Set<string>();

    for (let index = 0; index < value.length; index++) {
      const term = value[index];
      const prefix = `Termin ${index + 1}`;

      if (this.isRecord(term) === false) {
        errors.push(`${prefix}: nieprawidłowy wpis terminu`);
        continue;
      }

      const startDateIsValid = this.isCalendarDate(term.startDate);
      const endDateIsValid = this.isCalendarDate(term.endDate);

      if (startDateIsValid === false) {
        errors.push(`${prefix}: nieprawidłowa data początkowa`);
      }

      if (endDateIsValid === false) {
        errors.push(`${prefix}: nieprawidłowa data końcowa`);
      }

      if (
        startDateIsValid &&
        endDateIsValid &&
        (term.startDate as string) > (term.endDate as string)
      ) {
        errors.push(`${prefix}: data końcowa jest wcześniejsza od początkowej`);
      }

      if (startDateIsValid && endDateIsValid) {
        const range = `${term.startDate}/${term.endDate}`;

        if (ranges.has(range)) {
          errors.push(`${prefix}: zduplikowany zakres dat`);
        }

        ranges.add(range);
      }

      this.validateOptionalText(
        term.sourceUrl,
        `${prefix}: nieprawidłowe sourceUrl`,
        errors,
      );
      this.validateOptionalText(
        term.pdfFileName,
        `${prefix}: nieprawidłowe pdfFileName`,
        errors,
      );
      this.validateOptionalBoolean(
        term.isActive,
        `${prefix}: nieprawidłowe isActive`,
        errors,
      );
      this.validateNamedArray(
        term.categoryNames,
        `${prefix}, kategoria`,
        errors,
        true,
      );
      this.validatePrices(term.prices, prefix, errors);
    }
  }

  private validatePrices(
    value: unknown,
    termPrefix: string,
    errors: string[],
  ): void {
    if (Array.isArray(value) === false || value.length === 0) {
      errors.push(`${termPrefix}: brak cen`);
      return;
    }

    for (let index = 0; index < value.length; index++) {
      const price = value[index];
      const prefix = `${termPrefix}, cena ${index + 1}`;

      if (this.isRecord(price) === false) {
        errors.push(`${prefix}: nieprawidłowy wpis ceny`);
        continue;
      }

      if (this.isNonEmptyText(price.cabinTypeName) === false) {
        errors.push(`${prefix}: brak cabinTypeName`);
      }

      if (
        Number.isInteger(price.priceGrosze) === false ||
        (price.priceGrosze as number) < 0
      ) {
        errors.push(
          `${prefix}: priceGrosze musi być nieujemną liczbą całkowitą`,
        );
      }
    }
  }

  private validateItinerary(value: unknown, errors: string[]): void {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value) === false) {
      errors.push('Nieprawidłowy plan podróży');
      return;
    }

    for (let index = 0; index < value.length; index++) {
      const day = value[index];
      const prefix = `Plan podróży, dzień ${index + 1}`;

      if (this.isRecord(day) === false) {
        errors.push(`${prefix}: nieprawidłowy wpis`);
        continue;
      }

      if (Number.isInteger(day.day) === false) {
        errors.push(`${prefix}: day musi być liczbą całkowitą`);
      }

      if (this.isNonEmptyText(day.city) === false) {
        errors.push(`${prefix}: brak miasta`);
      }

      if (day.date !== undefined && this.isCalendarDate(day.date) === false) {
        errors.push(`${prefix}: nieprawidłowa data`);
      }

      this.validateOptionalText(
        day.arrivalTime,
        `${prefix}: nieprawidłowy arrivalTime`,
        errors,
      );
      this.validateOptionalText(
        day.departureTime,
        `${prefix}: nieprawidłowy departureTime`,
        errors,
      );
    }
  }

  private validateNamedArray(
    value: unknown,
    label: string,
    errors: string[],
    optional: boolean,
  ): void {
    if (value === undefined && optional) {
      return;
    }

    if (Array.isArray(value) === false) {
      errors.push(`${label}: wartość musi być tablicą`);
      return;
    }

    for (let index = 0; index < value.length; index++) {
      if (this.isNonEmptyText(value[index])) {
        continue;
      }

      errors.push(`${label} ${index + 1}: nazwa musi być niepustym tekstem`);
    }
  }

  private validateRequiredText(
    value: unknown,
    message: string,
    errors: string[],
  ): void {
    if (this.isNonEmptyText(value)) {
      return;
    }

    errors.push(message);
  }

  private validateOptionalText(
    value: unknown,
    message: string,
    errors: string[],
  ): void {
    if (value === undefined || typeof value === 'string') {
      return;
    }

    errors.push(message);
  }

  private validateOptionalBoolean(
    value: unknown,
    message: string,
    errors: string[],
  ): void {
    if (value === undefined || typeof value === 'boolean') {
      return;
    }

    errors.push(message);
  }

  private isCalendarDate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value) === false) {
      return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isNonEmptyText(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private readLabel(rawEntry: unknown, index: number): string {
    if (this.isRecord(rawEntry) && this.isNonEmptyText(rawEntry.name)) {
      return rawEntry.name.trim();
    }

    return `(wiersz ${index + 1})`;
  }

  private invalidRow(
    rowRef: string,
    label: string,
    errors: string[],
  ): ParsedOfferRow {
    return {
      rowRef,
      isUpdate: false,
      termPdfEntries: [],
      result: { rowRef, action: 'error', label, errors },
    };
  }

  private async resolveCompanyId(
    companyKey: string,
    errors: string[],
  ): Promise<string | undefined> {
    const company = await this.companyService.findOneByKey(companyKey.trim());

    if (company === null || company === undefined) {
      errors.push(`Nie znaleziono firmy o kluczu '${companyKey.trim()}'`);
      return undefined;
    }

    return company.id;
  }

  private async resolveShipId(
    shipName: string,
    companyId: string | undefined,
    errors: string[],
  ): Promise<string | undefined> {
    if (companyId === undefined) {
      return undefined;
    }

    try {
      const ship = await this.shipService.findOneByNameAndCompany(
        shipName.trim(),
        companyId,
      );

      if (ship === null || ship === undefined) {
        errors.push(`Nie znaleziono statku '${shipName.trim()}' dla tej firmy`);
        return undefined;
      }

      return ship.id;
    } catch (error) {
      if (
        error instanceof AppException &&
        error.key === 'IMPORT_REFERENCE_AMBIGUOUS'
      ) {
        errors.push(`Niejednoznaczne odwołanie '${shipName.trim()}'`);
        return undefined;
      }

      throw error;
    }
  }

  private async resolveDestinationIds(
    names: string[],
    errors: string[],
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const rawName of names) {
      const name = rawName.trim();
      const matches = await this.destinationRepository
        .createQueryBuilder('destination')
        .where('LOWER(destination.name) = LOWER(:name)', { name })
        .take(2)
        .getMany();

      if (matches.length === 0) {
        errors.push(`Nie znaleziono kierunku '${name}'`);
        continue;
      }

      if (matches.length > 1) {
        errors.push(`Niejednoznaczne odwołanie '${name}'`);
        continue;
      }

      ids.push(matches[0].id);
    }

    return ids;
  }

  private async resolveTerms(
    terms: OfferManifestTerm[],
    zipEntries: ZipEntry[],
    errors: string[],
  ): Promise<{
    dtos: OfferTermDto[];
    pdfEntries: (ZipEntry | undefined)[];
  }> {
    const dtos: OfferTermDto[] = [];
    const pdfEntries: (ZipEntry | undefined)[] = [];

    for (let index = 0; index < terms.length; index++) {
      const term = terms[index];
      const categoryIds =
        term.categoryNames === undefined
          ? undefined
          : await this.resolveCategoryIds(term.categoryNames, index, errors);
      const pdfEntry = this.resolvePdfEntry(
        term.pdfFileName,
        index,
        zipEntries,
        errors,
      );

      dtos.push({
        startDate: term.startDate,
        endDate: term.endDate,
        sourceUrl: term.sourceUrl,
        isActive: term.isActive,
        categories: categoryIds,
        prices: term.prices.map((price) => ({
          cabinTypeName: price.cabinTypeName.trim(),
          price: price.priceGrosze,
        })),
      });
      pdfEntries.push(pdfEntry);
    }

    return { dtos, pdfEntries };
  }

  private async resolveCategoryIds(
    names: string[],
    termIndex: number,
    errors: string[],
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const rawName of names) {
      const name = rawName.trim();
      const matches = await this.categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(category.name) = LOWER(:name)', { name })
        .take(2)
        .getMany();

      if (matches.length === 0) {
        errors.push(`Termin ${termIndex + 1}: nieznana kategoria '${name}'`);
        continue;
      }

      if (matches.length > 1) {
        errors.push(`Niejednoznaczne odwołanie '${name}'`);
        continue;
      }

      ids.push(matches[0].id);
    }

    return ids;
  }

  private resolveImageEntry(
    fileName: string | undefined,
    zipEntries: ZipEntry[],
    errors: string[],
  ): ZipEntry | undefined {
    if (fileName === undefined) {
      return undefined;
    }

    if (fileName.startsWith('images/') === false) {
      errors.push(`Nieprawidłowa ścieżka pliku obrazu '${fileName}'`);
      return undefined;
    }

    const entry = zipEntries.find((candidate) => candidate.name === fileName);

    if (entry === undefined) {
      errors.push(`Nie znaleziono pliku obrazu '${fileName}' w archiwum`);
      return undefined;
    }

    if (
      entry.data.length > IMAGE_MAX_BYTES ||
      detectImageExtension(entry.data) === null
    ) {
      errors.push(`Nieprawidłowy plik obrazu '${fileName}'`);
      return undefined;
    }

    return entry;
  }

  private resolvePdfEntry(
    fileName: string | undefined,
    termIndex: number,
    zipEntries: ZipEntry[],
    errors: string[],
  ): ZipEntry | undefined {
    if (fileName === undefined) {
      return undefined;
    }

    if (fileName.startsWith('pdfs/') === false) {
      errors.push(
        `Termin ${termIndex + 1}: nieprawidłowa ścieżka PDF '${fileName}'`,
      );
      return undefined;
    }

    const entry = zipEntries.find((candidate) => candidate.name === fileName);

    if (entry === undefined) {
      errors.push(
        `Termin ${termIndex + 1}: nie znaleziono pliku PDF '${fileName}'`,
      );
      return undefined;
    }

    if (
      entry.data.length > PDF_MAX_BYTES ||
      detectPdfExtension(entry.data) === null
    ) {
      errors.push(
        `Termin ${termIndex + 1}: nieprawidłowy plik PDF '${fileName}'`,
      );
      return undefined;
    }

    return entry;
  }

  private async resolveExistingOffer(
    id: string | undefined,
    errors: string[],
  ): Promise<{ offerId?: string; isUpdate: boolean }> {
    if (id === undefined) {
      return { isUpdate: false };
    }

    const existing = await this.offerService.findOneById(id);

    if (existing === null || existing === undefined) {
      errors.push('Rekord o podanym id nie istnieje');
      return { isUpdate: false };
    }

    return { offerId: existing.id, isUpdate: true };
  }

  private async validateOfferDto(dto: CreateOfferDto): Promise<string[]> {
    const validationErrors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    return this.flattenValidationErrors(validationErrors).map(
      (pathName) => `Nieprawidłowe dane oferty: ${pathName}`,
    );
  }

  private flattenValidationErrors(
    validationErrors: ValidationError[],
    parentPath = '',
  ): string[] {
    const paths: string[] = [];

    for (const error of validationErrors) {
      const currentPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints && Object.keys(error.constraints).length > 0) {
        paths.push(currentPath);
      }

      paths.push(
        ...this.flattenValidationErrors(error.children ?? [], currentPath),
      );
    }

    return paths;
  }

  private resolveAction(
    errors: string[],
    isUpdate: boolean,
  ): ImportRowResult['action'] {
    if (errors.length > 0) {
      return 'error';
    }

    if (isUpdate) {
      return 'update';
    }

    return 'create';
  }

  private summarize(rows: ParsedOfferRow[]): ImportPreviewResult {
    return {
      toCreate: rows.filter((row) => row.result.action === 'create').length,
      toUpdate: rows.filter((row) => row.result.action === 'update').length,
      errors: rows.filter((row) => row.result.action === 'error').length,
      rows: rows.map((row) => row.result),
    };
  }

  private async saveOffer(row: ParsedOfferRow, user: User): Promise<Offer> {
    if (row.dto === undefined) {
      throw new AppException(API_ERRORS.IMPORT_FILE_INVALID);
    }

    if (row.isUpdate) {
      return this.offerService.updateOffer(row.offerId, row.dto, user);
    }

    return this.offerService.createOffer(row.dto, user);
  }

  private async attachOfferImage(
    offerId: string,
    row: ParsedOfferRow,
    user: User,
  ): Promise<void> {
    if (row.imageEntry === undefined) {
      return;
    }

    await this.imageFileService.updateImageFile(
      offerId,
      ImageFileType.OFFER,
      this.toMulterFile(row.imageEntry),
      user,
    );
  }

  private async attachTermPdfs(
    savedOffer: Offer,
    row: ParsedOfferRow,
    user: User,
  ): Promise<void> {
    const dtoTerms = row.dto?.terms ?? [];

    for (let index = 0; index < dtoTerms.length; index++) {
      const entry = row.termPdfEntries[index];

      if (entry === undefined) {
        continue;
      }

      const matchingTerm = (savedOffer.terms ?? []).find((term) =>
        isSameDateRange(term, dtoTerms[index]),
      );

      if (matchingTerm === undefined) {
        throw new Error(
          `Nie znaleziono zapisanego terminu ${dtoTerms[index].startDate}–${dtoTerms[index].endDate}`,
        );
      }

      await this.pdfFileService.updatePdfFile(
        matchingTerm.id,
        PdfFileType.TERM,
        this.toMulterFile(entry),
        user,
      );
    }
  }

  private toMulterFile(entry: ZipEntry): Express.Multer.File {
    return {
      originalname: entry.name,
      buffer: entry.data,
      mimetype: 'application/octet-stream',
    } as Express.Multer.File;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.length > 0) {
      return error.message;
    }

    return 'Nieznany błąd importu';
  }
}
