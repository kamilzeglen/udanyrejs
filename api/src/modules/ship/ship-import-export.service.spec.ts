import { ShipImportExportService } from './ship-import-export.service';
import { buildZip } from '@core/import-export/zip.util';
import { readZip } from '@core/import-export/zip.util';

const validCsvRow =
  'id,name,companyKey,isActive,description,yearBuilt,renovation,speed,length,width,tonnage,passengersDecks,passengers,crew,currency,imageFileName\n' +
  ',Harmony,costa,true,Opis,2016,2024,22.5,362,66,226963,18,6780,2100,USD,\n';

describe('ShipImportExportService.exportToZip', () => {
  it('preserves renovation and speed in the CSV manifest', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 'ship-1',
          name: 'Harmony',
          company: { key: 'costa' },
          isActive: true,
          description: 'Opis',
          yearBuilt: 2016,
          renovation: 2024,
          speed: 22.5,
          length: 362,
          width: 66,
          tonnage: 226963,
          passengersDecks: 18,
          passengers: 6780,
          crew: 2100,
          currency: 'USD',
        },
      ]),
    };
    const service = new ShipImportExportService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const zip = await service.exportToZip();
    const csv = readZip(zip)
      .find((entry) => entry.name === 'data.csv')
      .data.toString('utf-8');

    expect(csv).toContain('yearBuilt,renovation,speed,length');
    expect(csv).toContain(',2016,2024,22.5,362,');
  });
});

describe('ShipImportExportService.preview', () => {
  it('resolves companyKey and marks the row as create', async () => {
    const shipService = { findOneById: jest.fn() };
    const companyService = {
      findOneByKey: jest
        .fn()
        .mockResolvedValue({ id: 'company-1', key: 'costa' }),
    };
    const service = new ShipImportExportService(
      {} as any,
      shipService as any,
      companyService as any,
      {} as any,
    );

    const zipBuffer = buildZip([{ name: 'data.csv', data: validCsvRow }]);
    const result = await service.preview(zipBuffer);

    expect(result.toCreate).toBe(1);
    expect(result.rows[0].errors).toEqual([]);
  });

  it('reports missing numeric fields', async () => {
    const shipService = { findOneById: jest.fn() };
    const companyService = {
      findOneByKey: jest
        .fn()
        .mockResolvedValue({ id: 'company-1', key: 'costa' }),
    };
    const service = new ShipImportExportService(
      {} as any,
      shipService as any,
      companyService as any,
      {} as any,
    );

    const zipBuffer = buildZip([
      {
        name: 'data.csv',
        data:
          'id,name,companyKey,isActive,description,yearBuilt,renovation,speed,length,width,tonnage,passengersDecks,passengers,crew,currency,imageFileName\n' +
          ',Harmony,costa,true,Opis,,,,,,,,,,,\n',
      },
    ]);
    const result = await service.preview(zipBuffer);

    expect(result.rows[0].errors).toContain(
      "Brak lub nieprawidłowe pole 'yearBuilt'",
    );
    expect(result.rows[0].errors).toContain('Brak waluty');
  });
});

describe('ShipImportExportService.confirm', () => {
  it('creates a ship with the resolved companyId and activates it', async () => {
    const shipService = {
      findOneById: jest.fn(),
      createShip: jest.fn().mockResolvedValue({ id: 'ship-new' }),
      bulkActivateShips: jest
        .fn()
        .mockResolvedValue({ updatedIds: ['ship-new'], failedIds: [] }),
    };
    const companyService = {
      findOneByKey: jest
        .fn()
        .mockResolvedValue({ id: 'company-1', key: 'costa' }),
    };
    const service = new ShipImportExportService(
      {} as any,
      shipService as any,
      companyService as any,
      {} as any,
    );

    const zipBuffer = buildZip([{ name: 'data.csv', data: validCsvRow }]);
    const result = await service.confirm(zipBuffer, { email: 'a@a.pl' } as any);

    expect(result.created).toEqual(['row-0']);
    expect(shipService.createShip).toHaveBeenCalledWith(
      {
        name: 'Harmony',
        companyId: 'company-1',
        description: 'Opis',
        yearBuilt: 2016,
        renovation: 2024,
        speed: 22.5,
        length: 362,
        width: 66,
        tonnage: 226963,
        passengersDecks: 18,
        passengers: 6780,
        crew: 2100,
        currency: 'USD',
      },
      { email: 'a@a.pl' },
    );
  });
});
