import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as usersActions from './users.actions';
import * as usersSelectors from './users.selectors';

@Injectable()
export class UsersFacade {
  public offers$ = this.store.select(usersSelectors.selectOffers);

  public getUsersSuccess$ = this.actions.pipe(ofType(usersActions.getUsersSuccess));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public getUsers(): void {
    this.store.dispatch(usersActions.getUsers());
  }
}
