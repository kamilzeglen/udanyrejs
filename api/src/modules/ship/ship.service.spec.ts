import { ShipService } from './ship.service';

describe('ShipService name identity', () => {
  it('returns the ship scoped to company and rejects ambiguous names', async () => {
    const ship = { id: 'ship', companyId: 'company', name: 'Harmony' };
    const query = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([ship]),
    };
    const service = new ShipService(
      { createQueryBuilder: () => query } as any,
      {} as any,
      {} as any,
      {} as any,
    );
    expect(await service.findOneByNameAndCompany('Harmony', 'company')).toEqual(
      ship,
    );
    expect(query.andWhere).toHaveBeenCalledWith('ship.companyId = :companyId', {
      companyId: 'company',
    });
    query.getMany.mockResolvedValue([ship, ship]);
    await expect(
      service.findOneByNameAndCompany('Harmony', 'company'),
    ).rejects.toMatchObject({ key: 'IMPORT_REFERENCE_AMBIGUOUS' });
  });

  it.each(['create', 'update'])(
    'maps duplicate names during %s to domain errors',
    async (operation) => {
      const ship = { id: 'ship', name: 'Harmony', companyId: 'company' };
      const query = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(ship),
      };
      const repository = {
        create: jest.fn().mockReturnValue(ship),
        createQueryBuilder: () => query,
        save: jest.fn().mockRejectedValue({ code: '23505' }),
      };
      const service = new ShipService(
        repository as any,
        {} as any,
        { findOneByEmail: jest.fn().mockResolvedValue({}) } as any,
        { createLog: jest.fn() } as any,
      );
      const pending =
        operation === 'create'
          ? service.createShip(ship as any, { email: 'admin' } as any)
          : service.updateShip('ship', ship as any, { email: 'admin' } as any);
      await expect(pending).rejects.toMatchObject({
        key: 'SHIP_NAME_DUPLICATE',
      });
    },
  );
});
