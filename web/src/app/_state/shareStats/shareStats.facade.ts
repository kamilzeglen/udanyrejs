import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import { Actions, ofType } from '@ngrx/effects';
import * as shareStatsActions from './shareStats.actions';

@Injectable()
export class ShareStatsFacade {
  public updateShareStatsSuccess = this.actions.pipe(ofType(shareStatsActions.updateShareStatsSuccess));
  public updateShareStatsError = this.actions.pipe(ofType(shareStatsActions.updateShareStatsError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public updateShareStats(payload: { platform: string; offerId: string }): void {
    this.store.dispatch(shareStatsActions.updateShareStats({ payload }));
  }
}
