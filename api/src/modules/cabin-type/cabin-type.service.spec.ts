import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CabinTypeService } from './cabin-type.service';
import { CabinType } from './cabin-type.entity';
import { UserService } from '@modules/user/user.service';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';
import { User } from '@modules/user/user.entity';

describe('CabinTypeService', () => {
  let service: CabinTypeService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: { createQueryBuilder: jest.Mock };
  };
  let logService: { createLog: jest.Mock };

  const requestUser = { email: 'admin@udanyrejs.pl' } as User;

  const queryBuilderMock = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  const offersCountQueryBuilderMock = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'cabin-type-1', ...data })),
      delete: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(() => queryBuilderMock),
      manager: {
        createQueryBuilder: jest.fn(() => offersCountQueryBuilderMock),
      },
    };
    logService = { createLog: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CabinTypeService,
        { provide: getRepositoryToken(CabinType), useValue: repository },
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn().mockResolvedValue(requestUser),
          },
        },
        { provide: LogService, useValue: logService },
      ],
    }).compile();

    service = module.get(CabinTypeService);
  });

  it('creates a cabin type for the given company', async () => {
    const dto = { name: 'Balkonowa', companyId: 'company-1' };

    const result = await service.createCabinType(dto, requestUser);

    expect(result).toEqual(
      expect.objectContaining({ name: 'Balkonowa', companyId: 'company-1' }),
    );
    expect(logService.createLog).toHaveBeenCalledWith(
      'Dodano rodzaj kabiny: Balkonowa',
      requestUser.email,
    );
  });

  it('throws CABIN_TYPE_NOT_FOUND when updating a missing cabin type', async () => {
    queryBuilderMock.getOne.mockResolvedValue(null);

    await expect(
      service.updateCabinType('missing-id', { name: 'X' }, requestUser),
    ).rejects.toThrow(AppException);
  });

  it('returns an empty array from findByIds without querying when given no ids', async () => {
    const result = await service.findByIds([]);

    expect(result).toEqual([]);
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('decorates findAll results with the number of offers using each cabin type', async () => {
    queryBuilderMock.getMany.mockResolvedValue([
      { id: 'cabin-type-1', name: 'Wewnętrzna' },
      { id: 'cabin-type-2', name: 'Balkonowa' },
    ] as CabinType[]);
    offersCountQueryBuilderMock.getRawMany.mockResolvedValue([
      { cabinTypeId: 'cabin-type-1', count: '3' },
    ]);

    const result = await service.findAll();

    expect(result).toEqual([
      expect.objectContaining({ id: 'cabin-type-1', offersCount: 3 }),
      expect.objectContaining({ id: 'cabin-type-2', offersCount: 0 }),
    ]);
  });

  it('removes a cabin type that no offer uses', async () => {
    queryBuilderMock.getOne.mockResolvedValue({
      id: 'cabin-type-1',
      name: 'Balkonowa',
    } as CabinType);
    offersCountQueryBuilderMock.getRawOne.mockResolvedValue({ count: '0' });

    const result = await service.removeCabinType('cabin-type-1', requestUser);

    expect(result).toBe(true);
    expect(repository.delete).toHaveBeenCalledWith('cabin-type-1');
    expect(logService.createLog).toHaveBeenCalledWith(
      'Usunięto rodzaj kabiny: Balkonowa (cabin-type-1)',
      requestUser.email,
    );
  });

  it('refuses to remove a cabin type used by at least one offer', async () => {
    queryBuilderMock.getOne.mockResolvedValue({
      id: 'cabin-type-1',
      name: 'Balkonowa',
    } as CabinType);
    offersCountQueryBuilderMock.getRawOne.mockResolvedValue({ count: '2' });

    await expect(
      service.removeCabinType('cabin-type-1', requestUser),
    ).rejects.toThrow(AppException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws CABIN_TYPE_NOT_FOUND when removing a missing cabin type', async () => {
    queryBuilderMock.getOne.mockResolvedValue(null);

    await expect(
      service.removeCabinType('missing-id', requestUser),
    ).rejects.toThrow(AppException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
