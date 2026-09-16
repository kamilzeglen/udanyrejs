function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function buildExportFilename(
  filename: string,
  generatedAt = new Date(),
): string {
  const extensionIndex = filename.lastIndexOf('.');
  const name = filename.slice(0, extensionIndex);
  const extension = filename.slice(extensionIndex);
  const timestamp = [
    generatedAt.getFullYear(),
    pad(generatedAt.getMonth() + 1),
    pad(generatedAt.getDate()),
    pad(generatedAt.getHours()),
    pad(generatedAt.getMinutes()),
    pad(generatedAt.getSeconds()),
  ].join('-');

  return `${name}-${timestamp}${extension}`;
}
