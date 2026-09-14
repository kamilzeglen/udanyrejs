import { CityImportExportService } from './city-import-export.service';
import { AppException } from '@core/errors/app-exception';
import { API_ERRORS } from '@core/errors/api-errors';

const CITY_ID = '48072cf6-4cc9-4318-ac56-453506ac706a';
const DESTINATION_ID = 'c0f1129f-334d-4072-a55c-c9c6773ed6f7';

describe('CityImportExportService', () => {
  it('exports destination names joined with semicolons', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: CITY_ID,
          name: 'Barcelona',
          isActive: true,
          destinations: [{ name: 'Morze Śródziemne' }, { name: 'Hiszpania' }],
        },
      ]),
    };
    const service = new CityImportExportService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    const csv = await service.exportToCsv();

    expect(csv).toBe(
      `id,name,isActive,destinationNames\n${CITY_ID},Barcelona,true,Morze Śródziemne;Hiszpania\n`,
    );
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'city.destinations',
      'destinations',
    );
  });

  it('resolves every destination name and previews a create without writing', async () => {
    const cityService = {
      findOneByID: jest.fn(),
      createCity: jest.fn(),
    };
    const destinationService = {
      findOneByName: jest
        .fn()
        .mockResolvedValueOnce({ id: DESTINATION_ID })
        .mockResolvedValueOnce({
          id: '82c1a7d1-28aa-413f-98fe-d7048f45d13f',
        }),
    };
    const service = new CityImportExportService(
      {} as any,
      cityService as any,
      destinationService as any,
    );

    const result = await service.preview(
      Buffer.from(
        'id,name,isActive,destinationNames\n,Barcelona,true,Hiszpania;Morze Śródziemne\n',
      ),
    );

    expect(result.toCreate).toBe(1);
    expect(result.errors).toBe(0);
    expect(destinationService.findOneByName).toHaveBeenNthCalledWith(
      1,
      'Hiszpania',
    );
    expect(destinationService.findOneByName).toHaveBeenNthCalledWith(
      2,
      'Morze Śródziemne',
    );
    expect(cityService.createCity).not.toHaveBeenCalled();
  });

  it('reports unresolved destination names and invalid identity values', async () => {
    const cityService = { findOneByID: jest.fn() };
    const destinationService = {
      findOneByName: jest.fn().mockResolvedValue(null),
    };
    const service = new CityImportExportService(
      {} as any,
      cityService as any,
      destinationService as any,
    );

    const result = await service.preview(
      Buffer.from(
        'id,name,isActive,destinationNames\nnot-a-uuid,Barcelona,tak,Atlantyda\n',
      ),
    );

    expect(result.rows[0].errors).toEqual([
      "Nie znaleziono kierunku 'Atlantyda'",
      'Nieprawidłowe id',
      'Nieprawidłowa wartość isActive',
    ]);
    expect(cityService.findOneByID).not.toHaveBeenCalled();
  });

  it('reports an ambiguous destination name as a row error', async () => {
    const destinationService = {
      findOneByName: jest
        .fn()
        .mockRejectedValue(
          new AppException(API_ERRORS.IMPORT_REFERENCE_AMBIGUOUS),
        ),
    };
    const service = new CityImportExportService(
      {} as any,
      { findOneByID: jest.fn() } as any,
      destinationService as any,
    );

    const result = await service.preview(
      Buffer.from(
        'id,name,isActive,destinationNames\n,Barcelona,true,Hiszpania\n',
      ),
    );

    expect(result.rows[0].errors).toContain(
      "Niejednoznaczne odwołanie 'Hiszpania'",
    );
    expect(result.rows[0].action).toBe('error');
  });

  it('confirms a create with resolved destination ids', async () => {
    const user = { email: 'admin@udanyrejs.pl' } as any;
    const cityService = {
      findOneByID: jest.fn(),
      createCity: jest.fn().mockResolvedValue({ id: CITY_ID }),
      bulkActivateCities: jest.fn().mockResolvedValue({
        updatedIds: [CITY_ID],
        failedIds: [],
      }),
    };
    const destinationService = {
      findOneByName: jest.fn().mockResolvedValue({ id: DESTINATION_ID }),
    };
    const service = new CityImportExportService(
      {} as any,
      cityService as any,
      destinationService as any,
    );

    const result = await service.confirm(
      Buffer.from(
        'id,name,isActive,destinationNames\n,Barcelona,true,Hiszpania\n',
      ),
      user,
    );

    expect(result.created).toEqual(['row-0']);
    expect(cityService.createCity).toHaveBeenCalledWith(
      { name: 'Barcelona', destinations: [DESTINATION_ID] },
      user,
    );
    expect(cityService.bulkActivateCities).toHaveBeenCalledWith(
      [CITY_ID],
      user,
    );
  });

  it('reports a freshly unresolved reference on confirm and continues the batch', async () => {
    const user = { email: 'admin@udanyrejs.pl' } as any;
    const cityService = {
      findOneByID: jest.fn(),
      createCity: jest.fn().mockResolvedValue({ id: CITY_ID }),
      bulkActivateCities: jest.fn().mockResolvedValue({
        updatedIds: [CITY_ID],
        failedIds: [],
      }),
    };
    const destinationService = {
      findOneByName: jest
        .fn()
        .mockResolvedValueOnce({ id: DESTINATION_ID })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: DESTINATION_ID }),
    };
    const service = new CityImportExportService(
      {} as any,
      cityService as any,
      destinationService as any,
    );
    const previewBuffer = Buffer.from(
      'id,name,isActive,destinationNames\n,Barcelona,true,Hiszpania\n',
    );

    await service.preview(previewBuffer);
    const result = await service.confirm(
      Buffer.from(
        'id,name,isActive,destinationNames\n,Barcelona,true,Hiszpania\n,Madryt,true,Hiszpania\n',
      ),
      user,
    );

    expect(result).toEqual({
      created: ['row-1'],
      updated: [],
      failed: [
        {
          rowRef: 'row-0',
          error: "Nie znaleziono kierunku 'Hiszpania'",
        },
      ],
    });
  });

  it('reports a failed active-state update for the affected row', async () => {
    const user = { email: 'admin@udanyrejs.pl' } as any;
    const cityService = {
      findOneByID: jest.fn(),
      createCity: jest.fn().mockResolvedValue({ id: CITY_ID }),
      bulkActivateCities: jest.fn().mockResolvedValue({
        updatedIds: [],
        failedIds: [CITY_ID],
      }),
    };
    const service = new CityImportExportService(
      {} as any,
      cityService as any,
      {
        findOneByName: jest.fn().mockResolvedValue({ id: DESTINATION_ID }),
      } as any,
    );

    const result = await service.confirm(
      Buffer.from(
        'id,name,isActive,destinationNames\n,Barcelona,true,Hiszpania\n',
      ),
      user,
    );

    expect(result.created).toEqual([]);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].rowRef).toBe('row-0');
  });
});
