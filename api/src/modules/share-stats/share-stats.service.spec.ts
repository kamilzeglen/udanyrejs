import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShareStatsService } from './share-stats.service';
import { ShareStats } from './share-stat.entity';
import { OfferTerm } from '@modules/offer/offer-term.entity';
import { LogService } from '@modules/log/log.service';
import { AppException } from '@core/errors/app-exception';

describe('ShareStatsService', () => {
  let service: ShareStatsService;
  let shareStatsRepository: { createQueryBuilder: jest.Mock; save: jest.Mock };
  let offerTermRepository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    shareStatsRepository = {
      createQueryBuilder: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    offerTermRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareStatsService,
        {
          provide: getRepositoryToken(ShareStats),
          useValue: shareStatsRepository,
        },
        {
          provide: getRepositoryToken(OfferTerm),
          useValue: offerTermRepository,
        },
        {
          provide: LogService,
          useValue: { createLog: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(ShareStatsService);
  });

  function mockTerm(term: Partial<OfferTerm> | null) {
    offerTermRepository.createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(term),
    });
  }

  function mockShareStats(shareStats: Partial<ShareStats> | null) {
    shareStatsRepository.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(shareStats),
    });
  }

  it('increments the web click counter of the specific term', async () => {
    mockTerm({
      id: 'term-1',
      offerId: 'offer-1',
      shareStatsId: 'stats-1',
      offer: { name: 'Rejs testowy' } as any,
    });
    mockShareStats({
      id: 'stats-1',
      webClicks: 0,
      facebookClicks: 0,
      instagramClicks: 0,
      tiktokClicks: 0,
    });

    const result = await service.update('web', 'term-1');

    expect(result).toBe(true);
    expect(shareStatsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ webClicks: 1 }),
    );
  });

  it('increments the facebook click counter, not web, for platform fb', async () => {
    mockTerm({
      id: 'term-1',
      offerId: 'offer-1',
      shareStatsId: 'stats-1',
      offer: { name: 'Rejs testowy' } as any,
    });
    mockShareStats({
      id: 'stats-1',
      webClicks: 5,
      facebookClicks: 0,
      instagramClicks: 0,
      tiktokClicks: 0,
    });

    await service.update('fb', 'term-1');

    expect(shareStatsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ webClicks: 5, facebookClicks: 1 }),
    );
  });

  it('throws when the term does not exist', async () => {
    mockTerm(null);

    await expect(service.update('web', 'missing-term')).rejects.toThrow(
      AppException,
    );
  });

  it('throws for an unsupported platform', async () => {
    mockTerm({
      id: 'term-1',
      offerId: 'offer-1',
      shareStatsId: 'stats-1',
      offer: { name: 'Rejs testowy' } as any,
    });
    mockShareStats({
      id: 'stats-1',
      webClicks: 0,
      facebookClicks: 0,
      instagramClicks: 0,
      tiktokClicks: 0,
    });

    await expect(service.update('unknown-platform', 'term-1')).rejects.toThrow(
      AppException,
    );
  });
});
