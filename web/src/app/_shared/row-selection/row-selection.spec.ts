import { take } from 'rxjs';
import { RowSelection } from './row-selection';

describe('RowSelection', () => {
  let selection: RowSelection;

  beforeEach(() => {
    selection = new RowSelection();
  });

  it('starts with no selected ids', (done) => {
    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(selectedIds.size).toBe(0);
      done();
    });
  });

  it('adds an id when toggled while unselected', (done) => {
    selection.toggle('a');

    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(selectedIds.has('a')).toBe(true);
      done();
    });
  });

  it('removes an id when toggled while already selected', (done) => {
    selection.toggle('a');
    selection.toggle('a');

    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(selectedIds.has('a')).toBe(false);
      done();
    });
  });

  it('keeps other selected ids when toggling one id', (done) => {
    selection.toggle('a');
    selection.toggle('b');
    selection.toggle('a');

    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(selectedIds.has('a')).toBe(false);
      expect(selectedIds.has('b')).toBe(true);
      done();
    });
  });

  it('adds all given ids on selectMany without dropping the existing selection', (done) => {
    selection.toggle('old');
    selection.selectMany(['a', 'b']);

    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(Array.from(selectedIds).sort()).toEqual(['a', 'b', 'old']);
      done();
    });
  });

  it('removes only the given ids on deselectMany, keeping the rest selected', (done) => {
    selection.selectMany(['a', 'b', 'c']);
    selection.deselectMany(['a', 'c']);

    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(Array.from(selectedIds).sort()).toEqual(['b']);
      done();
    });
  });

  it('empties the selection on clear', (done) => {
    selection.selectMany(['a', 'b']);
    selection.clear();

    selection.selectedIds$.pipe(take(1)).subscribe((selectedIds) => {
      expect(selectedIds.size).toBe(0);
      done();
    });
  });
});
