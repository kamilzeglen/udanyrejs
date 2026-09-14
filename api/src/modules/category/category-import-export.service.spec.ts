import { CategoryImportExportService } from './category-import-export.service';

const CATEGORY_ID = '9fac301d-d85f-4493-9f5c-cad7d267765a';

describe('CategoryImportExportService', () => {
  it('exports all category fields in the documented order', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: CATEGORY_ID,
          name: 'Lato',
          url: 'lato',
          position: 1,
          startDate: new Date('2026-06-01T00:00:00.000Z'),
          endDate: new Date('2026-08-31T00:00:00.000Z'),
          isActive: false,
          isVisible: true,
        },
      ]),
    };
    const service = new CategoryImportExportService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
    );

    const csv = await service.exportToCsv();

    expect(csv).toBe(
      `id,name,url,position,startDate,endDate,isActive,isVisible\n${CATEGORY_ID},Lato,lato,1,2026-06-01,2026-08-31,false,true\n`,
    );
  });

  it('previews a complete row as create without writing', async () => {
    const categoryService = {
      findOneByID: jest.fn(),
      createCategory: jest.fn(),
    };
    const service = new CategoryImportExportService(
      {} as any,
      categoryService as any,
    );

    const result = await service.preview(
      Buffer.from(
        'id,name,url,position,startDate,endDate,isActive,isVisible\n,Lato,lato,1,2026-06-01,2026-08-31,true,false\n',
      ),
    );

    expect(result).toEqual({
      toCreate: 1,
      toUpdate: 0,
      errors: 0,
      rows: [
        {
          rowRef: 'row-0',
          action: 'create',
          label: 'Lato',
          errors: [],
        },
      ],
    });
    expect(categoryService.createCategory).not.toHaveBeenCalled();
  });

  it('reports missing required fields in column order', async () => {
    const service = new CategoryImportExportService(
      {} as any,
      { findOneByID: jest.fn() } as any,
    );

    const result = await service.preview(
      Buffer.from(
        'id,name,url,position,startDate,endDate,isActive,isVisible\n,,,,,,,\n',
      ),
    );

    expect(result.rows[0].errors).toEqual([
      'Brak nazwy',
      'Brak url',
      'Brak lub nieprawidłowa pozycja',
      'Brak daty początkowej',
      'Brak daty końcowej',
    ]);
  });

  it('reports invalid DTO values, booleans and id', async () => {
    const categoryService = { findOneByID: jest.fn() };
    const service = new CategoryImportExportService(
      {} as any,
      categoryService as any,
    );

    const result = await service.preview(
      Buffer.from(
        'id,name,url,position,startDate,endDate,isActive,isVisible\nnot-a-uuid,Lato,lato,abc,wrong-date,also-wrong,tak,nie\n',
      ),
    );

    expect(result.rows[0].errors).toEqual([
      'Brak lub nieprawidłowa pozycja',
      'Nieprawidłowa data początkowa',
      'Nieprawidłowa data końcowa',
      'Nieprawidłowe id',
      'Nieprawidłowa wartość isActive',
      'Nieprawidłowa wartość isVisible',
    ]);
    expect(categoryService.findOneByID).not.toHaveBeenCalled();
  });

  it('confirms valid rows independently with booleans in the DTO', async () => {
    const user = { email: 'admin@udanyrejs.pl' } as any;
    const categoryService = {
      findOneByID: jest.fn().mockResolvedValue({ id: CATEGORY_ID }),
      createCategory: jest.fn().mockResolvedValue({ id: 'new-category' }),
      updateCategory: jest.fn().mockResolvedValue({ id: CATEGORY_ID }),
    };
    const service = new CategoryImportExportService(
      {} as any,
      categoryService as any,
    );
    const buffer = Buffer.from(
      `id,name,url,position,startDate,endDate,isActive,isVisible\n,Lato,lato,1,2026-06-01,2026-08-31,false,true\n${CATEGORY_ID},Zima,zima,2,2026-12-01,2027-02-28,true,false\nnot-a-uuid,Błędna,bledna,3,2026-01-01,2026-02-01,true,true\n`,
    );

    const result = await service.confirm(buffer, user);

    expect(result).toEqual({
      created: ['row-0'],
      updated: ['row-1'],
      failed: [{ rowRef: 'row-2', error: 'Nieprawidłowe id' }],
    });
    expect(categoryService.createCategory).toHaveBeenCalledWith(
      {
        name: 'Lato',
        url: 'lato',
        position: 1,
        startDate: '2026-06-01',
        endDate: '2026-08-31',
        isActive: false,
        isVisible: true,
      },
      user,
    );
    expect(categoryService.updateCategory).toHaveBeenCalledWith(
      CATEGORY_ID,
      {
        name: 'Zima',
        url: 'zima',
        position: 2,
        startDate: '2026-12-01',
        endDate: '2027-02-28',
        isActive: true,
        isVisible: false,
      },
      user,
    );
  });

  it('reports a domain write failure and continues with later rows', async () => {
    const categoryService = {
      findOneByID: jest.fn(),
      createCategory: jest
        .fn()
        .mockRejectedValueOnce(new Error('duplicate'))
        .mockResolvedValueOnce({ id: 'category-new' }),
    };
    const service = new CategoryImportExportService(
      {} as any,
      categoryService as any,
    );
    const buffer = Buffer.from(
      'id,name,url,position,startDate,endDate,isActive,isVisible\n,Lato,lato,1,2026-06-01,2026-08-31,true,true\n,Zima,zima,2,2026-12-01,2027-02-28,true,true\n',
    );

    const result = await service.confirm(buffer, {} as any);

    expect(result).toEqual({
      created: ['row-1'],
      updated: [],
      failed: [{ rowRef: 'row-0', error: 'duplicate' }],
    });
  });
});
