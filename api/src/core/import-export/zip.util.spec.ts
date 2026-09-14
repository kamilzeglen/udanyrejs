import * as AdmZip from 'adm-zip';
import { buildZip, readZip } from './zip.util';

describe('ZIP import/export', () => {
  it('round trips CSV and binary attachments', () => {
    const files = [
      { name: 'data.csv', data: Buffer.from('id,name\n,Port\n') },
      { name: 'images/row-0.jpg', data: Buffer.from([255, 216, 255, 0]) },
    ];
    expect(readZip(buildZip(files))).toEqual(files);
  });

  it('rejects invalid and empty archives', () => {
    expect(() => readZip(Buffer.from('invalid'))).toThrow();
    expect(() => readZip(new AdmZip().toBuffer())).toThrow();
  });

  it('rejects traversal paths on output', () => {
    expect(() => buildZip([{ name: '../secret', data: 'x' }])).toThrow();
  });
});
