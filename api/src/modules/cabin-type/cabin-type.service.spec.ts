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
    createQueryBuilder: jest.Mock;
  };
  let logService: { createLog: jest.Mock };

  const requestUser = { email: 'admin@udanyrejs.pl' } as User;

  const queryBuilderMock = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'cabin-type-1', ...data })),
      createQueryBuilder: jest.fn(() => queryBuilderMock),
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

  it('deactivates an existing cabin type', async () => {
    queryBuilderMock.getOne.mockResolvedValue({
      id: 'cabin-type-1',
      name: 'Balkonowa',
      isActive: true,
    } as CabinType);

    const result = await service.deactivateCabinType(
      'cabin-type-1',
      requestUser,
    );

    expect(result).toBe(true);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });

  it('returns an empty array from findByIds without querying when given no ids', async () => {
    const result = await service.findByIds([]);

    expect(result).toEqual([]);
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
