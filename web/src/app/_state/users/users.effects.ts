import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import * as usersActions from '@state/users/users.actions';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UsersHttpService} from '../../_http/users.http.service';


@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private http: UsersHttpService,
  ) {
  }

  getUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(usersActions.getUsers),
      switchMap(() => {
        return this.http.getUsers().pipe(
          map(users => {
            return usersActions.getUsersSuccess({users});
          }),
          catchError(errorMessage => {
            return of(usersActions.getUsersError({errorMessage}));
          })
        );
      })
    )
  );
}
