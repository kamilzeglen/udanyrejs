import { AppException } from '@core/errors/app-exception';
import { DestinationService } from './destination.service';

describe('DestinationService', () => {
  const requestUser = { email: 'admin@udanyrejs.pl' } as any;

  it('findAll includes the image needed by directory cards', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const service = new DestinationService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    await service.findAll();

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'destination.imageFile',
      'imageFile',
    );
  });

  it('findOneByName uses a case-insensitive exact match', async () => {
    const destination = {
      id: 'c0f1129f-334d-4072-a55c-c9c6773ed6f7',
      name: 'Karaiby',
    };
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([destination]),
    };
    const service = new DestinationService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    const result = await service.findOneByName('karaiby');

    expect(result).toEqual(destination);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(destination.name) = LOWER(:name)',
      { name: 'karaiby' },
    );
  });

  it('findOneByName returns null for an unknown name', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const service = new DestinationService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    await expect(service.findOneByName('Atlantyda')).resolves.toBeNull();
  });

  it('findPublicBySlug returns only an active destination with its image', async () => {
    const destination = { id: 'destination-1', slug: 'caribbean' };
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(destination),
    };
    const service = new DestinationService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    await expect(service.findPublicBySlug('caribbean')).resolves.toEqual(
      destination,
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'destination.slug = :slug',
      { slug: 'caribbean' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'destination.isActive = :isActive',
      { isActive: true },
    );
  });

  it('rejects an ambiguous case-insensitive name', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 'c0f1129f-334d-4072-a55c-c9c6773ed6f7', name: 'Karaiby' },
        { id: '82c1a7d1-28aa-413f-98fe-d7048f45d13f', name: 'KARAIBY' },
      ]),
    };
    const service = new DestinationService(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as any,
      {} as any,
      {} as any,
    );

    await expect(service.findOneByName('karaiby')).rejects.toMatchObject({
      key: 'IMPORT_REFERENCE_AMBIGUOUS',
    });
  });

  it.each([
    ['createDestination', false],
    ['updateDestination', true],
  ])(
    'maps a unique violation from %s to DESTINATION_NAME_DUPLICATE',
    async (method, isUpdate) => {
      const duplicateError = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'c0f1129f-334d-4072-a55c-c9c6773ed6f7',
          name: 'Karaiby',
        }),
      };
      const repository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue(duplicateError),
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      };
      const service = new DestinationService(
        repository as any,
        { findOneByEmail: jest.fn().mockResolvedValue(requestUser) } as any,
        { createLog: jest.fn() } as any,
      );

      const result = isUpdate
        ? service.updateDestination(
            'c0f1129f-334d-4072-a55c-c9c6773ed6f7',
            { name: 'Karaiby' },
            requestUser,
          )
        : service.createDestination({ name: 'Karaiby' }, requestUser);
      const error = await result.catch((caughtError) => caughtError);

      expect(error).toBeInstanceOf(AppException);
      expect(error.key).toBe('DESTINATION_NAME_DUPLICATE');
    },
  );
});
