import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { ImportConfirmResult, ImportEntityType, ImportPreviewResult } from '@interfaces';
import { map, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonHttpService } from './common.http.service';

const ENTITY_PATH: Record<ImportEntityType, string> = {
  offer: 'offers',
  ship: 'ship',
  company: 'company',
  category: 'category',
  destination: 'destination',
  city: 'city',
  cabinType: 'cabin-type',
};

export interface ImportExportDownload {
  blob: Blob;
  filename: string;
}

@Injectable({ providedIn: 'root' })
export class ImportExportHttpService {
  private readonly API_URL = environment.API_URL;

  constructor(
    private readonly http: HttpClient,
    private readonly commonHttpService: CommonHttpService,
  ) {}

  public previewImport(entityType: ImportEntityType, file: File): Observable<ImportPreviewResult> {
    return this.http.post<ImportPreviewResult>(this.buildUrl(entityType, 'import/preview'), this.toFormData(file));
  }

  public confirmImport(entityType: ImportEntityType, file: File): Observable<ImportConfirmResult> {
    return this.http
      .post<ImportConfirmResult>(this.buildUrl(entityType, 'import/confirm'), this.toFormData(file))
      .pipe(tap(() => this.commonHttpService.clearDictionaryCache()));
  }

  public exportEntities(entityType: ImportEntityType, ids?: string[]): Observable<ImportExportDownload> {
    const params = ids?.length ? { ids: ids.join(',') } : {};

    return this.http
      .get(this.buildUrl(entityType, 'export'), { params, observe: 'response', responseType: 'blob' })
      .pipe(map((response) => this.toDownload(response)));
  }

  private buildUrl(entityType: ImportEntityType, path: string): string {
    return `${this.API_URL}/${ENTITY_PATH[entityType]}/${path}`;
  }

  private toFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }

  private toDownload(response: HttpResponse<Blob>): ImportExportDownload {
    const contentDisposition = response.headers.get('Content-Disposition') ?? '';
    const filenameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);

    return {
      blob: response.body,
      filename: filenameMatch?.[1] ?? 'export',
    };
  }
}
