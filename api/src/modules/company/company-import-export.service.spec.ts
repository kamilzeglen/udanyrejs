import { CompanyImportExportService } from './company-import-export.service';
import { buildZip } from '@core/import-export/zip.util';

describe('CompanyImportExportService.exportToZip', () => {
  it('builds a zip with data.csv and no images entry when there is no image', async () => {
    const queryBuilder: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 'company-1',
          name: 'Costa',
          key: 'costa',
          isActive: true,
          description: 'Opis',
          priceIncludes: ['Wyżywienie'],
          priceExcludes: ['Napiwki'],
          imageFile: null,
        },
      ]),
    };
    const companyRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const service = new CompanyImportExportService(
      companyRepository as any,
      {} as any,
      {} as any,
    );

    const zipBuffer = await service.exportToZip();

    const { readZip } = await import('@core/import-export/zip.util');
    const entries = readZip(zipBuffer);
    expect(entries.map((entry) => entry.name)).toEqual(['data.csv']);
    expect(entries[0].data.toString()).toContain(
      'company-1,Costa,costa,true,Opis,Wyżywienie,Napiwki,',
    );
  });
});

describe('CompanyImportExportService.preview', () => {
  it('marks a row without id as create and reports a missing referenced image', async () => {
    const companyService = { findOneById: jest.fn() };
    const service = new CompanyImportExportService(
      {} as any,
      companyService as any,
      {} as any,
    );

    const zipBuffer = buildZip([
      {
        name: 'data.csv',
        data:
          'id,name,key,isActive,description,priceIncludes,priceExcludes,imageFileName\n' +
          ',Costa,costa,true,Opis,Wyżywienie,Napiwki,images/row-0.jpg\n',
      },
    ]);

    const result = await service.preview(zipBuffer);

    expect(result.errors).toBe(1);
    expect(result.rows[0].errors).toEqual([
      "Nie znaleziono pliku obrazu 'images/row-0.jpg' w archiwum",
    ]);
  });

  it('reports missing required fields', async () => {
    const companyService = { findOneById: jest.fn() };
    const service = new CompanyImportExportService(
      {} as any,
      companyService as any,
      {} as any,
    );

    const zipBuffer = buildZip([
      {
        name: 'data.csv',
        data: 'id,name,key,isActive,description,priceIncludes,priceExcludes,imageFileName\n,,,,,,,\n',
      },
    ]);

    const result = await service.preview(zipBuffer);

    expect(result.rows[0].errors).toEqual([
      'Brak nazwy',
      'Brak key',
      'Brak priceIncludes',
      'Brak priceExcludes',
    ]);
  });
});

describe('CompanyImportExportService.confirm', () => {
  it('creates a company, activates it and attaches the referenced image', async () => {
    const companyService = {
      findOneById: jest.fn(),
      createCompany: jest.fn().mockResolvedValue({ id: 'company-new' }),
      bulkActivateCompanies: jest
        .fn()
        .mockResolvedValue({ updatedIds: ['company-new'], failedIds: [] }),
    };
    const imageFileService = {
      updateImageFile: jest.fn().mockResolvedValue({}),
    };
    const service = new CompanyImportExportService(
      {} as any,
      companyService as any,
      imageFileService as any,
    );

    const zipBuffer = buildZip([
      {
        name: 'data.csv',
        data:
          'id,name,key,isActive,description,priceIncludes,priceExcludes,imageFileName\n' +
          ',Costa,costa,true,Opis,Wyżywienie,Napiwki,images/row-0.jpg\n',
      },
      { name: 'images/row-0.jpg', data: Buffer.from([0xff, 0xd8, 0xff, 0x00]) },
    ]);

    const result = await service.confirm(zipBuffer, { email: 'a@a.pl' } as any);

    expect(result.created).toEqual(['row-0']);
    expect(companyService.createCompany).toHaveBeenCalledWith(
      {
        name: 'Costa',
        key: 'costa',
        description: 'Opis',
        priceIncludes: ['Wyżywienie'],
        priceExcludes: ['Napiwki'],
      },
      { email: 'a@a.pl' },
    );
    expect(imageFileService.updateImageFile).toHaveBeenCalled();
  });
});
