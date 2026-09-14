import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environment';
import { ImportExportHttpService } from './import-export.http.service';
import { CommonHttpService } from './common.http.service';

describe('ImportExportHttpService', () => {
  let service: ImportExportHttpService;
  let http: HttpTestingController;
  let commonHttpService: CommonHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ImportExportHttpService);
    http = TestBed.inject(HttpTestingController);
    commonHttpService = TestBed.inject(CommonHttpService);
  });

  afterEach(() => {
    http.verify();
  });

  it('sends the selected file to the preview endpoint for ships', () => {
    const file = new File(['id,name'], 'ships.csv', { type: 'text/csv' });
    service.previewImport('ship', file).subscribe();

    const request = http.expectOne(`${environment.API_URL}/ship/import/preview`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('file')).toBe(file);
    request.flush({ toCreate: 1, toUpdate: 0, errors: 0, rows: [] });
  });

  it('maps cabinType to the cabin-type confirm endpoint', () => {
    spyOn(commonHttpService, 'clearDictionaryCache');
    const file = new File([], 'cabin-types.csv');
    service.confirmImport('cabinType', file).subscribe();

    const request = http.expectOne(`${environment.API_URL}/cabin-type/import/confirm`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('file')).toBe(file);
    request.flush({ created: [], updated: [], failed: [] });
    expect(commonHttpService.clearDictionaryCache).toHaveBeenCalledTimes(1);
  });

  it('uses the plural offers endpoint', () => {
    service.previewImport('offer', new File([], 'offers.zip')).subscribe();

    const request = http.expectOne(`${environment.API_URL}/offers/import/preview`);
    request.flush({ toCreate: 0, toUpdate: 0, errors: 0, rows: [] });
  });

  it('exports selected ids and reads a quoted filename', () => {
    let filename = '';
    service.exportEntities('company', ['company-1', 'company-2']).subscribe((result) => {
      filename = result.filename;
    });

    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${environment.API_URL}/company/export` &&
        candidate.params.get('ids') === 'company-1,company-2',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['zip']), { headers: { 'Content-Disposition': 'attachment; filename="companies.zip"' } });

    expect(filename).toBe('companies.zip');
  });

  it('omits ids for a full export and falls back to export filename', () => {
    let filename = '';
    service.exportEntities('destination').subscribe((result) => {
      filename = result.filename;
    });

    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${environment.API_URL}/destination/export` && candidate.params.has('ids') === false,
    );
    request.flush(new Blob(['csv']));

    expect(filename).toBe('export');
  });
});
