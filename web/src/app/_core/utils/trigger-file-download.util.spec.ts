import { triggerFileDownload } from './trigger-file-download.util';

describe('triggerFileDownload', () => {
  it('downloads with the supplied filename and always revokes the object URL', () => {
    const createObjectURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:download');
    const revokeObjectURL = spyOn(URL, 'revokeObjectURL');
    const click = jasmine.createSpy('click');
    const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement;
    spyOn(document, 'createElement').and.returnValue(anchor);

    const blob = new Blob(['csv']);
    triggerFileDownload(blob, 'destinations.csv');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchor.href).toBe('blob:download');
    expect(anchor.download).toBe('destinations.csv');
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:download');
  });
});
