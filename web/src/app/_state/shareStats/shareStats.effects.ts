import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as shareStatsActions from '@state/shareStats/shareStats.actions';
import {ShareStatsHttpService} from '@core/_http/shareStats.http.service';


@Injectable()
export class ShareStatsEffects {
  constructor(
    private actions$: Actions,
    private http: ShareStatsHttpService,
  ) {
  }

  updateShareStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shareStatsActions.updateShareStats),
      switchMap(({payload}) => {
        return this.http.shareStats(payload).pipe(
          map(() => {
            return shareStatsActions.updateShareStatsSuccess();
          }),
          catchError(() => {
            return of(shareStatsActions.updateShareStatsError());
          })
        );
      })
    )
  );
}
