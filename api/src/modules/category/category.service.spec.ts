import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { UserService } from '@modules/user/user.service';
import { LogService } from '@modules/log/log.service';

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
