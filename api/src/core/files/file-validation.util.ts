export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PDF_MAX_BYTES = 20 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const ALLOWED_PDF_MIME_TYPES = ['application/pdf'];

interface FileSignature {
  extension: string;
  matches: (buffer: Buffer) => boolean;
}

const IMAGE_SIGNATURES: FileSignature[] = [
  {
    extension: '.jpg',
    matches: (buffer) =>
      buffer.length > 2 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  {
    extension: '.png',
    matches: (buffer) =>
      buffer.length > 7 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a,
  },
  {
    extension: '.webp',
    matches: (buffer) =>
      buffer.length > 11 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP',
  },
];

const PDF_SIGNATURE: FileSignature = {
  extension: '.pdf',
  matches: (buffer) =>
    buffer.length > 3 && buffer.toString('ascii', 0, 4) === '%PDF',
};

// Rozpoznaje rzeczywisty typ pliku po sygnaturze bajtowej (magic bytes),
// nie po nazwie/rozszerzeniu/mimetype zadeklarowanym przez klienta - te
// można dowolnie podrobić. Zwraca bezpieczne, kanoniczne rozszerzenie
// do użycia w nazwie zapisywanego pliku, albo null gdy zawartość nie
// pasuje do żadnego dozwolonego typu.
export function detectImageExtension(buffer: Buffer): string | null {
  const signature = IMAGE_SIGNATURES.find((sig) => sig.matches(buffer));
  return signature ? signature.extension : null;
}

export function detectPdfExtension(buffer: Buffer): string | null {
  return PDF_SIGNATURE.matches(buffer) ? PDF_SIGNATURE.extension : null;
}
