import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as authActions from './auth.actions';
import * as authSelectors from './auth.selectors';
import { filter, Observable, tap } from 'rxjs';
import { User } from '@interfaces';

@Injectable()
export class AuthFacade {
  public myself$ = this.store.select(authSelectors.selectMyself);

  public getMyselfSuccess$ = this.actions.pipe(ofType(authActions.getMyselfSuccess));
  public getMyselfError$ = this.actions.pipe(ofType(authActions.getMyselfError));

  public loginSuccess$ = this.actions.pipe(ofType(authActions.loginSuccess));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public getMyself(redirect: string | null): void {
    this.store.dispatch(authActions.getMyself({ redirect }));
  }

  public getMyself$(redirect: string | null): Observable<User> {
    return this.store.select(authSelectors.selectMyself).pipe(
      tap((myself) => {
        if (!myself) {
          this.getMyself(redirect);
        }
      }),
      filter((myself) => {
        if (!myself) {
          return false;
        }
        return true;
      }),
    );
  }

  public login(payload: { email: string; password: string }, redirect: string | null): void {
    this.store.dispatch(authActions.login({ payload, redirect }));
  }
}
