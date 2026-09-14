import { CabinTypeImportExportService } from './cabin-type-import-export.service';

const CABIN_TYPE_ID = 'a045e78c-48b6-4aa0-a9a2-8c09a07eaaac';
const COMPANY_ID = '4e8081b0-8a31-46a2-99ca-cc6c8d5168d7';

describe('CabinTypeImportExportService', () => {
  it('exports the natural company key', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: CABIN_TYPE_ID,
          name: 'Balkonowa',
          company: { key: 'costa' },
          isActive: true,
        },
      ]),
    };
    const service = new CabinTypeImportExportService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    const csv = await service.exportToCsv();

    expect(csv).toBe(
      `id,name,companyKey,isActive\n${CABIN_TYPE_ID},Balkonowa,costa,true\n`,
    );
  });

  it('resolves companyKey and previews a create without writing', async () => {
    const cabinTypeService = {
      findOneById: jest.fn(),
      createCabinType: jest.fn(),
    };
    const companyService = {
      findOneByKey: jest.fn().mockResolvedValue({ id: COMPANY_ID }),
    };
    const service = new CabinTypeImportExportService(
      {} as any,
      cabinTypeService as any,
      companyService as any,
    );

    const result = await service.preview(
      Buffer.from('id,name,companyKey,isActive\n,Balkonowa,costa,true\n'),
    );

    expect(result.toCreate).toBe(1);
    expect(result.errors).toBe(0);
    expect(companyService.findOneByKey).toHaveBeenCalledWith('costa');
    expect(cabinTypeService.createCabinType).not.toHaveBeenCalled();
  });

  it('reports missing fields, unknown company and invalid values', async () => {
    const cabinTypeService = { findOneById: jest.fn() };
    const companyService = {
      findOneByKey: jest.fn().mockResolvedValue(null),
    };
    const service = new CabinTypeImportExportService(
      {} as any,
      cabinTypeService as any,
      companyService as any,
    );

    const result = await service.preview(
      Buffer.from('id,name,companyKey,isActive\nnot-a-uuid,,unknown,tak\n'),
    );

    expect(result.rows[0].errors).toEqual([
      'Brak nazwy',
      "Nie znaleziono firmy o kluczu 'unknown'",
      'Nieprawidłowe id',
      'Nieprawidłowa wartość isActive',
    ]);
    expect(cabinTypeService.findOneById).not.toHaveBeenCalled();
  });

  it('reports a missing companyKey without resolving it', async () => {
    const companyService = { findOneByKey: jest.fn() };
    const service = new CabinTypeImportExportService(
      {} as any,
      { findOneById: jest.fn() } as any,
      companyService as any,
    );

    const result = await service.preview(
      Buffer.from('id,name,companyKey,isActive\n,Balkonowa,,true\n'),
    );

    expect(result.rows[0].errors).toEqual(['Brak companyKey']);
    expect(companyService.findOneByKey).not.toHaveBeenCalled();
  });

  it('confirms valid rows with the resolved company and active state', async () => {
    const user = { email: 'admin@udanyrejs.pl' } as any;
    const cabinTypeService = {
      findOneById: jest.fn(),
      createCabinType: jest.fn().mockResolvedValue({ id: CABIN_TYPE_ID }),
      bulkDeactivateCabinTypes: jest.fn().mockResolvedValue({
        updatedIds: [CABIN_TYPE_ID],
        failedIds: [],
      }),
    };
    const companyService = {
      findOneByKey: jest.fn().mockResolvedValue({ id: COMPANY_ID }),
    };
    const service = new CabinTypeImportExportService(
      {} as any,
      cabinTypeService as any,
      companyService as any,
    );

    const result = await service.confirm(
      Buffer.from('id,name,companyKey,isActive\n,Balkonowa,costa,false\n'),
      user,
    );

    expect(result.created).toEqual(['row-0']);
    expect(cabinTypeService.createCabinType).toHaveBeenCalledWith(
      { name: 'Balkonowa', companyId: COMPANY_ID },
      user,
    );
    expect(cabinTypeService.bulkDeactivateCabinTypes).toHaveBeenCalledWith(
      [CABIN_TYPE_ID],
      user,
    );
  });

  it('validates companyKey again during confirm', async () => {
    const companyService = {
      findOneByKey: jest
        .fn()
        .mockResolvedValueOnce({ id: COMPANY_ID })
        .mockResolvedValueOnce(null),
    };
    const cabinTypeService = {
      findOneById: jest.fn(),
      createCabinType: jest.fn(),
    };
    const service = new CabinTypeImportExportService(
      {} as any,
      cabinTypeService as any,
      companyService as any,
    );
    const buffer = Buffer.from(
      'id,name,companyKey,isActive\n,Balkonowa,costa,true\n',
    );

    await service.preview(buffer);
    const result = await service.confirm(buffer, {} as any);

    expect(result.failed).toEqual([
      {
        rowRef: 'row-0',
        error: "Nie znaleziono firmy o kluczu 'costa'",
      },
    ]);
    expect(cabinTypeService.createCabinType).not.toHaveBeenCalled();
  });
});
