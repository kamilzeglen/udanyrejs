import { CompanyService } from './company.service';

describe('CompanyService.findOneByKey', () => {
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
});
