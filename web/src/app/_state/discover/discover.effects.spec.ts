import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { DiscoverEffects } from './discover.effects';
import { DiscoverHttpService } from '@core/_http/discover.http.service';
import * as discoverActions from './discover.actions';

describe('DiscoverEffects.getDrafts$', () => {
  let actions$: Observable<unknown>;
  let effects: DiscoverEffects;
  let httpService: jasmine.SpyObj<DiscoverHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('DiscoverHttpService', [
      'startDiscovery',
      'getDrafts',
      'getDraft',
      'deleteDraft',
    ]);

    TestBed.configureTestingModule({
      providers: [
        DiscoverEffects,
        provideMockActions(() => actions$),
        { provide: DiscoverHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(DiscoverEffects);
  });

  it('dispatches getDraftsSuccess when the HTTP call succeeds', (done) => {
    const drafts = [{ id: 'draft-1', name: 'Rejs testowy' }] as never;
    httpService.getDrafts.and.returnValue(of(drafts));
    actions$ = of(discoverActions.getDrafts());

    effects.getDrafts$.subscribe((action) => {
      expect(action).toEqual(discoverActions.getDraftsSuccess({ drafts }));
      done();
    });
  });

  it('dispatches getDraftsError when the HTTP call fails', (done) => {
    httpService.getDrafts.and.returnValue(throwError(() => 'network error'));
    actions$ = of(discoverActions.getDrafts());

    effects.getDrafts$.subscribe((action) => {
      expect(action).toEqual(discoverActions.getDraftsError({ errorMessage: 'network error' }));
      done();
    });
  });
});

describe('DiscoverEffects.deleteDraft$', () => {
  let actions$: Observable<unknown>;
  let effects: DiscoverEffects;
  let httpService: jasmine.SpyObj<DiscoverHttpService>;

  beforeEach(() => {
    httpService = jasmine.createSpyObj('DiscoverHttpService', [
      'startDiscovery',
      'getDrafts',
      'getDraft',
      'deleteDraft',
    ]);

    TestBed.configureTestingModule({
      providers: [
        DiscoverEffects,
        provideMockActions(() => actions$),
        { provide: DiscoverHttpService, useValue: httpService },
      ],
    });

    effects = TestBed.inject(DiscoverEffects);
  });

  it('dispatches deleteDraftSuccess when the HTTP call succeeds', (done) => {
    httpService.deleteDraft.and.returnValue(of(true));
    actions$ = of(discoverActions.deleteDraft({ payload: { id: 'draft-1' } }));

    effects.deleteDraft$.subscribe((action) => {
      expect(action).toEqual(discoverActions.deleteDraftSuccess());
      done();
    });
  });
});
