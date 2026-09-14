import { parseBooleanColumn, parseCsv, stringifyCsv } from './csv.util';

describe('CSV import/export', () => {
  it('round trips quoted Polish multiline content', () => {
    const rows = [{ id: '', name: 'Łódź, port\nPółnoc' }];
    expect(parseCsv(Buffer.from(stringifyCsv(rows, ['id', 'name'])))).toEqual(
      rows,
    );
  });

  it('accepts UTF-8 BOM and header-only exports', () => {
    expect(parseCsv(Buffer.from('\uFEFFid,name\n'))).toEqual([]);
  });

  it('rejects malformed records and duplicate headers', () => {
    expect(() => parseCsv(Buffer.from('id,name\n1,port,extra'))).toThrow();
    expect(() => parseCsv(Buffer.from('name,name\nx,y'))).toThrow();
  });

  it('parses explicit booleans and rejects typos', () => {
    expect(parseBooleanColumn('TRUE', false)).toBe(true);
    expect(parseBooleanColumn('false', true)).toBe(false);
    expect(parseBooleanColumn('', true)).toBe(true);
    expect(() => parseBooleanColumn('tru', true)).toThrow();
  });
});
