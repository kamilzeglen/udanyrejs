import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import * as commonActions from '@state/common/common.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CommonHttpService} from '../../_http/common.http.service';

@Injectable()
export class CommonEffects {
  constructor(
    private actions$: Actions,
    private http: CommonHttpService,
  ) {
  }

  getCompanies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getCompanies),
      switchMap(() => {
        return this.http.getCompanies().pipe(
          map(companies => {
            return commonActions.getCompaniesSuccess({companies});
          }),
          catchError(errorMessage => {
            return of(commonActions.getCompaniesError({errorMessage}));
          })
        );
      })
    )
  );

  getShips$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getShips),
      switchMap(({companyId}) => {
        return this.http.getShips({companyId}).pipe(
          map(ships => {
            return commonActions.getShipsSuccess({ships});
          }),
          catchError(errorMessage => {
            return of(commonActions.getShipsError({errorMessage}));
          })
        );
      })
    )
  )

}
