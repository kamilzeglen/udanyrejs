import {Injectable} from '@angular/core';
import {Actions} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as commonActions from './common.actions';
import * as commonSelectors from './common.selectors';


@Injectable()
export class CommonFacade {
  public companies$ = this.store.select(commonSelectors.selectCompanies);
  public ships$ = this.store.select(commonSelectors.selectShips);

  public loading$ = this.store.select(commonSelectors.selectLoading);

  constructor(
    private store: Store<AppState>,
    private actions: Actions
  ) {
  }

  public getCompanies(): void {
    this.store.dispatch(commonActions.getCompanies());
  }

  public getShips(companyId: string): void {
    this.store.dispatch(commonActions.getShips({companyId}));
  }

}
