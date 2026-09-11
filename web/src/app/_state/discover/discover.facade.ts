import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as discoverActions from './discover.actions';
import * as discoverSelectors from './discover.selectors';

@Injectable()
export class DiscoverFacade {
  public starting$ = this.store.select(discoverSelectors.selectStarting);
  public drafts$ = this.store.select(discoverSelectors.selectDrafts);

  public startDiscoverySuccess$ = this.actions.pipe(ofType(discoverActions.startDiscoverySuccess));
  public startDiscoveryError$ = this.actions.pipe(ofType(discoverActions.startDiscoveryError));
  public getDraftsSuccess$ = this.actions.pipe(ofType(discoverActions.getDraftsSuccess));
  public getDraftsError$ = this.actions.pipe(ofType(discoverActions.getDraftsError));
  public getDraftSuccess$ = this.actions.pipe(ofType(discoverActions.getDraftSuccess));
  public getDraftError$ = this.actions.pipe(ofType(discoverActions.getDraftError));
  public deleteDraftSuccess$ = this.actions.pipe(ofType(discoverActions.deleteDraftSuccess));
  public deleteDraftError$ = this.actions.pipe(ofType(discoverActions.deleteDraftError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public startDiscovery(payload: { count: number; companyIds: string[] }): void {
    this.store.dispatch(discoverActions.startDiscovery({ payload }));
  }

  public getDrafts(): void {
    this.store.dispatch(discoverActions.getDrafts());
  }

  public getDraft(payload: { id: string }): void {
    this.store.dispatch(discoverActions.getDraft({ payload }));
  }

  public deleteDraft(payload: { id: string }): void {
    this.store.dispatch(discoverActions.deleteDraft({ payload }));
  }
}
