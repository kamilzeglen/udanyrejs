import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { PdfFileService } from './pdf-file.service';
import { PdfFile } from './pdf-file.entity';
import { OfferTerm } from '@modules/offer/offer-term.entity';
import { User } from '@modules/user/user.entity';
import { AppException } from '@core/errors/app-exception';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PdfFileService.downloadPdfFromUrl', () => {
  let service: PdfFileService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PdfFileService,
        { provide: getRepositoryToken(PdfFile), useValue: {} },
        { provide: getRepositoryToken(OfferTerm), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(PdfFileService);
    jest.clearAllMocks();
  });

  it('sends a browser-like User-Agent and Referer so rejsy4you does not reject a bare server-to-server request', async () => {
    mockedAxios.get.mockResolvedValue({
      data: Buffer.from('%PDF-1.4'),
      headers: { 'content-type': 'application/pdf' },
    });

    await service.downloadPdfFromUrl(
      'https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=1&scheduleId=2',
    );

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=1&scheduleId=2',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Mozilla'),
          Referer: 'https://rejsy4you.pl/',
        }),
      }),
    );
  });

  it('throws FILE_DOWNLOAD_FAILED and does not swallow the failure when the source host rejects the request', async () => {
    mockedAxios.get.mockRejectedValue(
      new Error('Request failed with status code 403'),
    );

    await expect(
      service.downloadPdfFromUrl(
        'https://rejsy4you.pl/api/Itineraries/offerPdf?itineraryId=1&scheduleId=2',
      ),
    ).rejects.toThrow(AppException);
  });
});
