import { AppException } from '@core/errors/app-exception';
import { buildZip, readZip } from '@core/import-export/zip.util';
import { OfferImportExportService } from './offer-import-export.service';

const COMPANY_ID = '11111111-1111-4111-8111-111111111111';
const SHIP_ID = '22222222-2222-4222-8222-222222222222';
const DESTINATION_ID = '33333333-3333-4333-8333-333333333333';
const CATEGORY_ID = '44444444-4444-4444-8444-444444444444';
const OFFER_ID = '55555555-5555-4555-8555-555555555555';
const TERM_ID = '66666666-6666-4666-8666-666666666666';

function manifestWithOneOffer(overrides: Record<string, unknown> = {}) {
  return [
    {
      name: 'Rejs po Karaibach',
      companyKey: 'costa',
      shipName: 'Harmony',
      destinationNames: ['Karaiby'],
      terms: [
        {
          startDate: '2026-06-01',
          endDate: '2026-06-08',
          categoryNames: ['Lato'],
          prices: [{ cabinTypeName: 'Balkonowa', priceGrosze: 350000 }],
        },
      ],
      ...overrides,
    },
  ];
}

function createQueryBuilder(rows: unknown[] = []) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  };
}

function createService(
  options: {
    offersForExport?: unknown[];
    offerService?: Record<string, jest.Mock>;
    companyService?: Record<string, jest.Mock>;
    shipService?: Record<string, jest.Mock>;
    destinations?: unknown[];
    categories?: unknown[];
    imageFileService?: Record<string, jest.Mock>;
    pdfFileService?: Record<string, jest.Mock>;
  } = {},
) {
  const offerQueryBuilder = createQueryBuilder(options.offersForExport);
  const destinationQueryBuilder = createQueryBuilder(
    options.destinations ?? [{ id: DESTINATION_ID, name: 'Karaiby' }],
  );
  const categoryQueryBuilder = createQueryBuilder(
    options.categories ?? [{ id: CATEGORY_ID, name: 'Lato' }],
  );
  const offerService = options.offerService ?? {
    findOneById: jest.fn(),
    createOffer: jest.fn(),
    updateOffer: jest.fn(),
  };
  const companyService = options.companyService ?? {
    findOneByKey: jest.fn().mockResolvedValue({ id: COMPANY_ID, key: 'costa' }),
  };
  const shipService = options.shipService ?? {
    findOneByNameAndCompany: jest
      .fn()
      .mockResolvedValue({ id: SHIP_ID, name: 'Harmony' }),
  };
  const imageFileService = options.imageFileService ?? {
    updateImageFile: jest.fn(),
  };
  const pdfFileService = options.pdfFileService ?? {
    updatePdfFile: jest.fn(),
  };

  const service = new OfferImportExportService(
    { createQueryBuilder: jest.fn().mockReturnValue(offerQueryBuilder) } as any,
    offerService as any,
    companyService as any,
    shipService as any,
    {
      createQueryBuilder: jest.fn().mockReturnValue(destinationQueryBuilder),
    } as any,
    {
      createQueryBuilder: jest.fn().mockReturnValue(categoryQueryBuilder),
    } as any,
    imageFileService as any,
    pdfFileService as any,
  );

  return {
    service,
    offerQueryBuilder,
    destinationQueryBuilder,
    categoryQueryBuilder,
    offerService,
    companyService,
    shipService,
    imageFileService,
    pdfFileService,
  };
}

function zipManifest(
  manifest: unknown,
  files: { name: string; data: Buffer }[] = [],
) {
  return buildZip([
    { name: 'offers.json', data: JSON.stringify(manifest) },
    ...files,
  ]);
}

describe('OfferImportExportService.preview', () => {
  it('resolves references and reports a valid new offer without writing data', async () => {
    const context = createService();

    const result = await context.service.preview(
      zipManifest(manifestWithOneOffer()),
    );

    expect(result).toEqual({
      toCreate: 1,
      toUpdate: 0,
      errors: 0,
      rows: [
        {
          rowRef: 'row-0',
          action: 'create',
          label: 'Rejs po Karaibach',
          errors: [],
        },
      ],
    });
    expect(context.shipService.findOneByNameAndCompany).toHaveBeenCalledWith(
      'Harmony',
      COMPANY_ID,
    );
    expect(context.offerService.createOffer).not.toHaveBeenCalled();
    expect(context.offerService.updateOffer).not.toHaveBeenCalled();
    expect(context.imageFileService.updateImageFile).not.toHaveBeenCalled();
    expect(context.pdfFileService.updatePdfFile).not.toHaveBeenCalled();
  });

  it('reports an unknown ship scoped to the resolved company', async () => {
    const context = createService({
      shipService: {
        findOneByNameAndCompany: jest.fn().mockResolvedValue(null),
      },
    });

    const result = await context.service.preview(
      zipManifest(manifestWithOneOffer()),
    );

    expect(result.errors).toBe(1);
    expect(result.rows[0].errors).toContain(
      "Nie znaleziono statku 'Harmony' dla tej firmy",
    );
  });

  it('rejects ambiguous case-insensitive destination references', async () => {
    const context = createService({
      destinations: [
        { id: DESTINATION_ID, name: 'Karaiby' },
        {
          id: '77777777-7777-4777-8777-777777777777',
          name: 'KARAIBY',
        },
      ],
    });

    const result = await context.service.preview(
      zipManifest(manifestWithOneOffer()),
    );

    expect(result.rows[0].action).toBe('error');
    expect(result.rows[0].errors).toContain(
      "Niejednoznaczne odwołanie 'Karaiby'",
    );
  });

  it('validates nested values, UUIDs and real calendar dates before resolving references', async () => {
    const context = createService();
    const manifest = manifestWithOneOffer({
      id: 'not-a-uuid',
      destinationNames: [''],
      terms: [
        {
          startDate: '2026-02-30',
          endDate: '2026-06-08T00:00:00.000Z',
          categoryNames: [12],
          prices: [{ cabinTypeName: '', priceGrosze: 3.5 }, null],
        },
      ],
    });

    const result = await context.service.preview(zipManifest(manifest));

    expect(result.rows[0].action).toBe('error');
    expect(result.rows[0].errors).toEqual(
      expect.arrayContaining([
        'Nieprawidłowe id oferty',
        'Kierunek 1: nazwa musi być niepustym tekstem',
        'Termin 1: nieprawidłowa data początkowa',
        'Termin 1: nieprawidłowa data końcowa',
        'Termin 1, kategoria 1: nazwa musi być niepustym tekstem',
        'Termin 1, cena 1: brak cabinTypeName',
        'Termin 1, cena 1: priceGrosze musi być nieujemną liczbą całkowitą',
        'Termin 1, cena 2: nieprawidłowy wpis ceny',
      ]),
    );
    expect(context.offerService.findOneById).not.toHaveBeenCalled();
    expect(context.destinationQueryBuilder.getMany).not.toHaveBeenCalled();
    expect(context.categoryQueryBuilder.getMany).not.toHaveBeenCalled();
  });

  it('rejects a manifest whose top level is not an array', async () => {
    const context = createService();

    await expect(
      context.service.preview(zipManifest({ offers: [] })),
    ).rejects.toThrow(AppException);
  });

  it('reports an offer without terms as an invalid row', async () => {
    const context = createService();

    const result = await context.service.preview(
      zipManifest(manifestWithOneOffer({ terms: [] })),
    );

    expect(result.rows[0].errors).toContain('Brak terminów');
  });

  it('validates image and PDF contents during preview without invoking file services', async () => {
    const context = createService();
    const manifest = manifestWithOneOffer({
      imageFileName: 'images/offer.jpg',
      terms: [
        {
          startDate: '2026-06-01',
          endDate: '2026-06-08',
          categoryNames: ['Lato'],
          pdfFileName: 'pdfs/term.pdf',
          prices: [{ cabinTypeName: 'Balkonowa', priceGrosze: 350000 }],
        },
      ],
    });

    const result = await context.service.preview(
      zipManifest(manifest, [
        { name: 'images/offer.jpg', data: Buffer.from('not-an-image') },
        { name: 'pdfs/term.pdf', data: Buffer.from('not-a-pdf') },
      ]),
    );

    expect(result.rows[0].errors).toEqual(
      expect.arrayContaining([
        "Nieprawidłowy plik obrazu 'images/offer.jpg'",
        "Termin 1: nieprawidłowy plik PDF 'pdfs/term.pdf'",
      ]),
    );
    expect(context.imageFileService.updateImageFile).not.toHaveBeenCalled();
    expect(context.pdfFileService.updatePdfFile).not.toHaveBeenCalled();
  });
});

describe('OfferImportExportService.confirm', () => {
  it('validates the archive again and skips a row whose reference became stale', async () => {
    const companyService = {
      findOneByKey: jest
        .fn()
        .mockResolvedValueOnce({ id: COMPANY_ID, key: 'costa' })
        .mockResolvedValueOnce(null),
    };
    const context = createService({ companyService });
    const archive = zipManifest(manifestWithOneOffer());

    const preview = await context.service.preview(archive);
    const result = await context.service.confirm(archive, {
      email: 'admin@udanyrejs.pl',
    } as any);

    expect(preview.toCreate).toBe(1);
    expect(result.failed).toEqual([
      {
        rowRef: 'row-0',
        error: "Nie znaleziono firmy o kluczu 'costa'",
      },
    ]);
    expect(context.offerService.createOffer).not.toHaveBeenCalled();
  });

  it('continues the batch after one row fails validation', async () => {
    const offerService = {
      findOneById: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({
        id: OFFER_ID,
        terms: [],
      }),
      updateOffer: jest.fn(),
    };
    const context = createService({ offerService });
    const invalidOffer = {
      ...manifestWithOneOffer()[0],
      name: '',
    };

    const result = await context.service.confirm(
      zipManifest([...manifestWithOneOffer(), invalidOffer]),
      { email: 'admin@udanyrejs.pl' } as any,
    );

    expect(result.created).toEqual(['row-0']);
    expect(result.failed).toEqual([{ rowRef: 'row-1', error: 'Brak nazwy' }]);
    expect(offerService.createOffer).toHaveBeenCalledTimes(1);
  });

  it('attaches files to persisted offer and term IDs matched by calendar dates', async () => {
    const offerService = {
      findOneById: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({
        id: OFFER_ID,
        terms: [
          {
            id: TERM_ID,
            startDate: new Date(2026, 5, 1),
            endDate: new Date(2026, 5, 8),
          },
        ],
      }),
      updateOffer: jest.fn(),
    };
    const context = createService({ offerService });
    const manifest = manifestWithOneOffer({
      imageFileName: 'images/offer.png',
      terms: [
        {
          startDate: '2026-06-01',
          endDate: '2026-06-08',
          categoryNames: ['Lato'],
          pdfFileName: 'pdfs/term.pdf',
          prices: [{ cabinTypeName: 'Balkonowa', priceGrosze: 350000 }],
        },
      ],
    });
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pdf = Buffer.from('%PDF-1.4');

    const result = await context.service.confirm(
      zipManifest(manifest, [
        { name: 'images/offer.png', data: png },
        { name: 'pdfs/term.pdf', data: pdf },
      ]),
      { email: 'admin@udanyrejs.pl' } as any,
    );

    expect(result.created).toEqual(['row-0']);
    expect(context.imageFileService.updateImageFile).toHaveBeenCalledWith(
      OFFER_ID,
      'offer',
      expect.objectContaining({
        originalname: 'images/offer.png',
        buffer: png,
      }),
      { email: 'admin@udanyrejs.pl' },
    );
    expect(context.pdfFileService.updatePdfFile).toHaveBeenCalledWith(
      TERM_ID,
      'term',
      expect.objectContaining({
        originalname: 'pdfs/term.pdf',
        buffer: pdf,
      }),
      { email: 'admin@udanyrejs.pl' },
    );
  });

  it('updates an existing offer through updateOffer', async () => {
    const offerService = {
      findOneById: jest.fn().mockResolvedValue({ id: OFFER_ID }),
      createOffer: jest.fn(),
      updateOffer: jest.fn().mockResolvedValue({ id: OFFER_ID, terms: [] }),
    };
    const context = createService({ offerService });

    const result = await context.service.confirm(
      zipManifest(manifestWithOneOffer({ id: OFFER_ID })),
      { email: 'admin@udanyrejs.pl' } as any,
    );

    expect(result.updated).toEqual(['row-0']);
    expect(offerService.updateOffer).toHaveBeenCalledWith(
      OFFER_ID,
      expect.objectContaining({ name: 'Rejs po Karaibach' }),
      { email: 'admin@udanyrejs.pl' },
    );
    expect(offerService.createOffer).not.toHaveBeenCalled();
  });

  it('preserves omitted destination and category relations during update', async () => {
    const offerService = {
      findOneById: jest.fn().mockResolvedValue({ id: OFFER_ID }),
      createOffer: jest.fn(),
      updateOffer: jest.fn().mockResolvedValue({ id: OFFER_ID, terms: [] }),
    };
    const context = createService({ offerService });
    const manifest = manifestWithOneOffer({
      id: OFFER_ID,
      destinationNames: undefined,
      terms: [
        {
          startDate: '2026-06-01',
          endDate: '2026-06-08',
          prices: [{ cabinTypeName: 'Balkonowa', priceGrosze: 350000 }],
        },
      ],
    });

    await context.service.confirm(zipManifest(manifest), {
      email: 'admin@udanyrejs.pl',
    } as any);

    expect(offerService.updateOffer).toHaveBeenCalledWith(
      OFFER_ID,
      expect.objectContaining({
        destinations: undefined,
        terms: [expect.objectContaining({ categories: undefined })],
      }),
      { email: 'admin@udanyrejs.pl' },
    );
  });
});

describe('OfferImportExportService.exportToZip', () => {
  it('exports the full offer graph and referenced files', async () => {
    const context = createService({
      offersForExport: [
        {
          id: OFFER_ID,
          name: 'Rejs po Karaibach',
          offerUrl: 'https://example.com/offer',
          syncData: true,
          isRecommended: true,
          company: { key: 'costa' },
          ship: { name: 'Harmony' },
          destinations: [{ name: 'Karaiby' }],
          itinerary: [
            {
              day: 1,
              date: '2026-06-01',
              city: 'Miami',
              arrivalTime: '',
              departureTime: '18:00',
            },
          ],
          terms: [
            {
              id: TERM_ID,
              startDate: new Date(2026, 5, 1),
              endDate: new Date(2026, 5, 8),
              sourceUrl: 'https://example.com/term',
              isActive: true,
              categories: [{ name: 'Lato' }],
              prices: [
                {
                  price: 350000,
                  cabinType: { name: 'Balkonowa' },
                },
              ],
            },
          ],
        },
      ],
    });

    const archive = await context.service.exportToZip();
    const entries = readZip(archive);
    const manifest = JSON.parse(
      entries
        .find((entry) => entry.name === 'offers.json')
        .data.toString('utf-8'),
    );

    expect(manifest).toEqual([
      {
        id: OFFER_ID,
        name: 'Rejs po Karaibach',
        offerUrl: 'https://example.com/offer',
        syncData: true,
        isRecommended: true,
        companyKey: 'costa',
        shipName: 'Harmony',
        destinationNames: ['Karaiby'],
        itinerary: [
          {
            day: 1,
            date: '2026-06-01',
            city: 'Miami',
            arrivalTime: '',
            departureTime: '18:00',
          },
        ],
        terms: [
          {
            startDate: '2026-06-01',
            endDate: '2026-06-08',
            sourceUrl: 'https://example.com/term',
            isActive: true,
            categoryNames: ['Lato'],
            prices: [{ cabinTypeName: 'Balkonowa', priceGrosze: 350000 }],
          },
        ],
      },
    ]);
    expect(context.offerQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'termPrices.cabinType',
      'cabinType',
    );
  });
});
