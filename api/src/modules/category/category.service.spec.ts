import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { UserService } from '@modules/user/user.service';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';

describe('CategoryService.findAll', () => {
  let service: CategoryService;
  let categoryRepository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    categoryRepository = { createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(Category), useValue: categoryRepository },
        { provide: UserService, useValue: {} },
        { provide: LogService, useValue: {} },
      ],
    }).compile();

    service = module.get(CategoryService);
  });

  it('counts distinct offers, not distinct terms, when a category tags two terms of the same offer', async () => {
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn().mockResolvedValue({
        entities: [{ id: 'cat-zima', name: 'Zima' }],
        raw: [{ offerCount: '1' }],
      }),
    };
    categoryRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findAll();

    expect(result).toEqual([{ id: 'cat-zima', name: 'Zima', offerCount: 1 }]);
    expect(queryBuilder.leftJoin).toHaveBeenCalledWith(
      'category.terms',
      'term',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'COUNT(DISTINCT term.offerId)',
      'offerCount',
    );
  });
});

describe('CategoryService duplicate name handling', () => {
  const requestUser = { email: 'admin@udanyrejs.pl' } as any;

  it.each([
    ['createCategory', false],
    ['updateCategory', true],
  ])(
    'maps a unique violation from %s to CATEGORY_NAME_DUPLICATE',
    async (method, isUpdate) => {
      const duplicateError = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: '9fac301d-d85f-4493-9f5c-cad7d267765a',
          name: 'Lato',
        }),
      };
      const repository = {
        create: jest.fn((value) => value),
        save: jest.fn().mockRejectedValue(duplicateError),
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      };
      const service = new CategoryService(
        repository as any,
        { findOneByEmail: jest.fn().mockResolvedValue(requestUser) } as any,
        { createLog: jest.fn() } as any,
      );
      const dto = {
        name: 'Lato',
        url: 'lato',
        position: 1,
        startDate: '2026-06-01',
        endDate: '2026-08-31',
      } as any;

      const result = isUpdate
        ? service.updateCategory(
            '9fac301d-d85f-4493-9f5c-cad7d267765a',
            dto,
            requestUser,
          )
        : service.createCategory(dto, requestUser);
      const error = await result.catch((caughtError) => caughtError);

      expect(error).toBeInstanceOf(AppException);
      expect(error.key).toBe('CATEGORY_NAME_DUPLICATE');
    },
  );

  it('keeps non-unique database errors unchanged', async () => {
    const databaseError = Object.assign(new Error('connection lost'), {
      code: '08006',
    });
    const repository = {
      create: jest.fn((value) => value),
      save: jest.fn().mockRejectedValue(databaseError),
    };
    const service = new CategoryService(
      repository as any,
      { findOneByEmail: jest.fn().mockResolvedValue(requestUser) } as any,
      { createLog: jest.fn() } as any,
    );

    await expect(
      service.createCategory({ name: 'Lato' } as any, requestUser),
    ).rejects.toBe(databaseError);
  });
});
