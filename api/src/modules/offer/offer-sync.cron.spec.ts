import { Test } from '@nestjs/testing';
import { OfferSyncCron } from './offer-sync.cron';
import { OfferService } from './offer.service';
import { OfferSyncService } from './offer-sync.service';

describe('OfferSyncCron.runSyncForAllOffers', () => {
  let cron: OfferSyncCron;
  let offerService: { findOffersForSync: jest.Mock };
  let offerSyncService: { syncOffer: jest.Mock };

  beforeEach(async () => {
    process.env.SYNC_REQUEST_DELAY_MS = '0';
    offerService = { findOffersForSync: jest.fn() };
    offerSyncService = { syncOffer: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OfferSyncCron,
        { provide: OfferService, useValue: offerService },
        { provide: OfferSyncService, useValue: offerSyncService },
      ],
    }).compile();

    cron = moduleRef.get(OfferSyncCron);
  });

  it('syncs every offer with a URL, one at a time, in order', async () => {
    const callOrder: string[] = [];
    offerService.findOffersForSync.mockResolvedValue([
      { id: 'offer-1' },
      { id: 'offer-2' },
    ]);
    offerSyncService.syncOffer.mockImplementation(async (offer) => {
      callOrder.push(offer.id);
    });

    await cron.runSyncForAllOffers();

    expect(callOrder).toEqual(['offer-1', 'offer-2']);
  });

  it('continues with the next offer when one sync throws', async () => {
    offerService.findOffersForSync.mockResolvedValue([
      { id: 'offer-1' },
      { id: 'offer-2' },
    ]);
    offerSyncService.syncOffer
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined);

    await expect(cron.runSyncForAllOffers()).resolves.not.toThrow();
    expect(offerSyncService.syncOffer).toHaveBeenCalledTimes(2);
  });
});
