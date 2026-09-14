import { parseExportIds, requireImportFile } from './import-upload.util';
import { detectZipExtension } from '@core/files/file-validation.util';

describe('import transport validation', () => {
  it('requires a nonempty uploaded file', () => {
    expect(() => requireImportFile(undefined)).toThrow();
    expect(() =>
      requireImportFile({ buffer: Buffer.alloc(0) } as Express.Multer.File),
    ).toThrow();
  });

  it('accepts selected UUIDs but rejects empty or malformed selections', () => {
    expect(parseExportIds(undefined)).toBeUndefined();
    expect(parseExportIds('550e8400-e29b-41d4-a716-446655440000')).toEqual([
      '550e8400-e29b-41d4-a716-446655440000',
    ]);
    expect(() => parseExportIds('')).toThrow();
    expect(() => parseExportIds('bad')).toThrow();
  });

  it('recognizes ZIP magic bytes and rejects CSV', () => {
    expect(detectZipExtension(Buffer.from([0x50, 0x4b, 3, 4]))).toBe('.zip');
    expect(detectZipExtension(Buffer.from('id,name'))).toBeNull();
  });
});
