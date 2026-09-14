import { DestinationImportExportService } from './destination-import-export.service';

const EXISTING_ID = 'c0f1129f-334d-4072-a55c-c9c6773ed6f7';

describe('DestinationImportExportService', () => {
  it('exports all rows in the documented column order', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([
          { id: EXISTING_ID, name: 'Karaiby', isActive: true },
        ]),
    };
    const service = new DestinationImportExportService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
    );

    const csv = await service.exportToCsv();

    expect(csv).toBe(`id,name,isActive\n${EXISTING_ID},Karaiby,true\n`);
    expect(queryBuilder.where).not.toHaveBeenCalled();
  });

  it('filters export by the requested ids', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const service = new DestinationImportExportService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
    );

    await service.exportToCsv([EXISTING_ID]);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'destination.id IN (:...ids)',
      { ids: [EXISTING_ID] },
    );
  });

  it('previews a valid row without writing', async () => {
    const destinationService = {
      findOneByID: jest.fn(),
      createDestination: jest.fn(),
      updateDestination: jest.fn(),
    };
    const service = new DestinationImportExportService(
      {} as any,
      destinationService as any,
    );

    const result = await service.preview(
      Buffer.from('id,name,isActive\n,Karaiby,true\n'),
    );

    expect(result).toEqual({
      toCreate: 1,
      toUpdate: 0,
      errors: 0,
      rows: [
        {
          rowRef: 'row-0',
          action: 'create',
          label: 'Karaiby',
          errors: [],
        },
      ],
    });
    expect(destinationService.createDestination).not.toHaveBeenCalled();
    expect(destinationService.updateDestination).not.toHaveBeenCalled();
  });

  it('previews an existing id as update', async () => {
    const destinationService = {
      findOneByID: jest.fn().mockResolvedValue({ id: EXISTING_ID }),
    };
    const service = new DestinationImportExportService(
      {} as any,
      destinationService as any,
    );

    const result = await service.preview(
      Buffer.from(`id,name,isActive\n${EXISTING_ID},Karaiby,false\n`),
    );

    expect(result.toUpdate).toBe(1);
    expect(result.rows[0].action).toBe('update');
  });

  it.each([
    ['not-a-uuid', 'Nieprawidłowe id'],
    ['', 'Brak nazwy'],
  ])(
    'reports invalid identity data as a row error',
    async (id, expectedError) => {
      const destinationService = { findOneByID: jest.fn() };
      const service = new DestinationImportExportService(
        {} as any,
        destinationService as any,
      );
      const name = id ? 'Karaiby' : '';

      const result = await service.preview(
        Buffer.from(`id,name,isActive\n${id},${name},true\n`),
      );

      expect(result.errors).toBe(1);
      expect(result.rows[0].errors).toContain(expectedError);
      expect(destinationService.findOneByID).not.toHaveBeenCalled();
    },
  );

  it('reports an unknown valid id as a row error', async () => {
    const destinationService = {
      findOneByID: jest.fn().mockResolvedValue(null),
    };
    const service = new DestinationImportExportService(
      {} as any,
      destinationService as any,
    );

    const result = await service.preview(
      Buffer.from(`id,name,isActive\n${EXISTING_ID},Karaiby,true\n`),
    );

    expect(result.rows[0].errors).toEqual(['Rekord o podanym id nie istnieje']);
  });

  it('reports an invalid boolean as a row error', async () => {
    const service = new DestinationImportExportService(
      {} as any,
      { findOneByID: jest.fn() } as any,
    );

    const result = await service.preview(
      Buffer.from('id,name,isActive\n,Karaiby,tak\n'),
    );

    expect(result.rows[0].errors).toContain('Nieprawidłowa wartość isActive');
  });

  it('confirms valid rows independently and applies their active state', async () => {
    const user = { email: 'admin@udanyrejs.pl' } as any;
    const destinationService = {
      findOneByID: jest.fn().mockResolvedValue({ id: EXISTING_ID }),
      createDestination: jest.fn().mockResolvedValue({
        id: '2e3c4fdc-7568-4a9b-a5a5-22bcbf6a39ff',
      }),
      updateDestination: jest.fn().mockResolvedValue({ id: EXISTING_ID }),
      bulkActivateDestinations: jest.fn().mockResolvedValue({
        updatedIds: ['2e3c4fdc-7568-4a9b-a5a5-22bcbf6a39ff'],
        failedIds: [],
      }),
      bulkDeactivateDestinations: jest.fn().mockResolvedValue({
        updatedIds: [EXISTING_ID],
        failedIds: [],
      }),
    };
    const service = new DestinationImportExportService(
      {} as any,
      destinationService as any,
    );
    const buffer = Buffer.from(
      `id,name,isActive\n,Nowy,true\n${EXISTING_ID},Karaiby,false\nnot-a-uuid,Błędny,true\n`,
    );

    const result = await service.confirm(buffer, user);

    expect(result).toEqual({
      created: ['row-0'],
      updated: ['row-1'],
      failed: [{ rowRef: 'row-2', error: 'Nieprawidłowe id' }],
    });
    expect(destinationService.createDestination).toHaveBeenCalledWith(
      { name: 'Nowy' },
      user,
    );
    expect(destinationService.updateDestination).toHaveBeenCalledWith(
      EXISTING_ID,
      { name: 'Karaiby' },
      user,
    );
    expect(destinationService.bulkActivateDestinations).toHaveBeenCalledWith(
      ['2e3c4fdc-7568-4a9b-a5a5-22bcbf6a39ff'],
      user,
    );
    expect(destinationService.bulkDeactivateDestinations).toHaveBeenCalledWith(
      [EXISTING_ID],
      user,
    );
  });

  it('validates the file again when confirm runs', async () => {
    const destinationService = {
      findOneByID: jest
        .fn()
        .mockResolvedValueOnce({ id: EXISTING_ID })
        .mockResolvedValueOnce(null),
      updateDestination: jest.fn(),
    };
    const service = new DestinationImportExportService(
      {} as any,
      destinationService as any,
    );
    const buffer = Buffer.from(
      `id,name,isActive\n${EXISTING_ID},Karaiby,true\n`,
    );

    await service.preview(buffer);
    const result = await service.confirm(buffer, {} as any);

    expect(result.failed).toEqual([
      { rowRef: 'row-0', error: 'Rekord o podanym id nie istnieje' },
    ]);
    expect(destinationService.updateDestination).not.toHaveBeenCalled();
  });
});
