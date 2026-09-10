import {
  detectImageExtension,
  detectPdfExtension,
} from './file-validation.util';

describe('detectImageExtension', () => {
  it('recognizes a JPEG by its magic bytes', () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x00]);
    expect(detectImageExtension(buffer)).toBe('.jpg');
  });

  it('recognizes a PNG by its magic bytes', () => {
    const buffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    expect(detectImageExtension(buffer)).toBe('.png');
  });

  it('recognizes a WEBP by its RIFF/WEBP markers', () => {
    const buffer = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0x00, 0x00, 0x00, 0x00]),
      Buffer.from('WEBP', 'ascii'),
    ]);
    expect(detectImageExtension(buffer)).toBe('.webp');
  });

  it('rejects content that does not match a known image signature', () => {
    const buffer = Buffer.from('not an image', 'ascii');
    expect(detectImageExtension(buffer)).toBeNull();
  });

  it('rejects a renamed file whose bytes do not match its extension', () => {
    // np. plik .png na dysku, ale wewnątrz to zwykły tekst - dokładnie ten
    // przypadek, przed którym ta funkcja ma chronić.
    const buffer = Buffer.from('<script>alert(1)</script>', 'ascii');
    expect(detectImageExtension(buffer)).toBeNull();
  });
});

describe('detectPdfExtension', () => {
  it('recognizes a PDF by its %PDF header', () => {
    const buffer = Buffer.from('%PDF-1.7\n...', 'ascii');
    expect(detectPdfExtension(buffer)).toBe('.pdf');
  });

  it('rejects content that does not start with %PDF', () => {
    const buffer = Buffer.from('not a pdf', 'ascii');
    expect(detectPdfExtension(buffer)).toBeNull();
  });
});
