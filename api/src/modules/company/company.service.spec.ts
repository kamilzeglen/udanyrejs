import { CompanyService } from './company.service';

describe('CompanyService.findOneByKey', () => {
  it('findAll includes the image needed by directory cards', async () => {
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    const service = new CompanyService(
      { createQueryBuilder: jest.fn().mockReturnValue(query) } as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAll();

    expect(query.leftJoinAndSelect).toHaveBeenCalledWith(
      'company.imageFile',
      'imageFile',
    );
  });

  it('uses the exact unique company key and returns absence', async () => {
    const query = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    const service = new CompanyService(
      { createQueryBuilder: () => query } as any,
      {} as any,
      {} as any,
      {} as any,
    );
    expect(await service.findOneByKey('costa')).toBeNull();
    expect(query.where).toHaveBeenCalledWith('company.key = :key', {
      key: 'costa',
    });
  });

  it('findPublicBySlug returns only an active company with its image', async () => {
    const company = { id: 'company-1', slug: 'msc-cruises' };
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(company),
    };
    const service = new CompanyService(
      { createQueryBuilder: jest.fn().mockReturnValue(query) } as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await expect(service.findPublicBySlug('msc-cruises')).resolves.toEqual(
      company,
    );
    expect(query.where).toHaveBeenCalledWith('company.slug = :slug', {
      slug: 'msc-cruises',
    });
    expect(query.andWhere).toHaveBeenCalledWith(
      'company.isActive = :isActive',
      { isActive: true },
    );
  });
});
