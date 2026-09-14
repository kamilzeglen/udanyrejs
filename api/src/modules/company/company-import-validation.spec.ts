import { CompanyImportExportService } from './company-import-export.service';
import { buildZip } from '@core/import-export/zip.util';
import { stringifyCsv } from '@core/import-export/csv.util';

const companyId = '550e8400-e29b-41d4-a716-446655440000';
const raw = {
  id: '',
  name: 'Costa',
  key: 'costa',
  isActive: 'true',
  description: '',
  priceIncludes: 'Posiłki',
  priceExcludes: 'Napiwki',
  imageFileName: '',
};
function archive(rows: (typeof raw)[], image?: Buffer): Buffer {
  const files = [
    {
      name: 'data.csv',
      data: Buffer.from(stringifyCsv(rows, Object.keys(raw))),
    },
  ];
  if (image) {
    files.push({ name: 'images/row-0.jpg', data: image });
  }
  return buildZip(files);
}
function setup() {
  const domain = {
    findOneById: jest.fn().mockResolvedValue({ id: companyId }),
    createCompany: jest.fn().mockResolvedValue({ id: companyId }),
    updateCompany: jest.fn().mockResolvedValue({ id: companyId }),
    bulkActivateCompanies: jest
      .fn()
      .mockResolvedValue({ updatedIds: [companyId], failedIds: [] }),
    bulkDeactivateCompanies: jest
      .fn()
      .mockResolvedValue({ updatedIds: [companyId], failedIds: [] }),
  };
  const images = { updateImageFile: jest.fn() };
  return {
    domain,
    images,
    service: new CompanyImportExportService(
      {} as any,
      domain as any,
      images as any,
    ),
  };
}
describe('company archive validation and writes', () => {
  it('rejects missing data.csv', async () => {
    await expect(
      setup().service.preview(
        buildZip([{ name: 'wrong.csv', data: 'id,name' }]),
      ),
    ).rejects.toThrow();
  });
  it('rejects image content during preview before any save', async () => {
    const { service, domain, images } = setup();
    const result = await service.preview(
      archive(
        [{ ...raw, imageFileName: 'images/row-0.jpg' }],
        Buffer.from('not an image'),
      ),
    );
    expect(result.errors).toBe(1);
    expect(domain.createCompany).not.toHaveBeenCalled();
    expect(images.updateImageFile).not.toHaveBeenCalled();
  });
  it('reports invalid UUID and boolean per row, still imports the valid row', async () => {
    const { service, domain } = setup();
    const result = await service.confirm(
      archive([{ ...raw, id: 'invalid' }, { ...raw, isActive: 'tru' }, raw]),
      {} as any,
    );
    expect(result.failed).toHaveLength(2);
    expect(result.created).toEqual(['row-2']);
    expect(domain.createCompany).toHaveBeenCalledTimes(1);
    expect(domain.findOneById).not.toHaveBeenCalled();
  });
  it('revalidates existence on confirm', async () => {
    const { service, domain } = setup();
    const buffer = archive([{ ...raw, id: companyId }]);
    expect((await service.preview(buffer)).toUpdate).toBe(1);
    domain.findOneById.mockResolvedValue(null);
    expect((await service.confirm(buffer, {} as any)).failed).toHaveLength(1);
    expect(domain.updateCompany).not.toHaveBeenCalled();
  });
  it('reports active-state failure rather than a false success', async () => {
    const { service, domain } = setup();
    domain.bulkActivateCompanies.mockResolvedValue({
      updatedIds: [],
      failedIds: [companyId],
    });
    const result = await service.confirm(archive([raw]), {} as any);
    expect(result.created).toEqual([]);
    expect(result.failed).toHaveLength(1);
  });
});
