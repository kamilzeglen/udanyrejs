import { SitemapService } from './sitemap.service';

describe('SitemapService', () => {
  it('generates public URLs only for active records with a slug', async () => {
    const destinationQuery = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ slug: 'south-america' }]),
    };
    const companyQuery = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ slug: 'msc-cruises' }]),
    };
    const service = new SitemapService(
      { createQueryBuilder: jest.fn().mockReturnValue(companyQuery) } as any,
      {
        createQueryBuilder: jest.fn().mockReturnValue(destinationQuery),
      } as any,
      { get: jest.fn().mockReturnValue('https://udanyrejs.pl') } as any,
    );

    const sitemap = await service.generate();

    expect(sitemap).toContain(
      '<loc>https://udanyrejs.pl/destinations/south-america</loc>',
    );
    expect(sitemap).toContain(
      '<loc>https://udanyrejs.pl/cruise-lines/msc-cruises</loc>',
    );
    expect(destinationQuery.andWhere).toHaveBeenCalledWith(
      'destination.slug IS NOT NULL',
    );
    expect(companyQuery.andWhere).toHaveBeenCalledWith(
      'company.slug IS NOT NULL',
    );
  });
});
