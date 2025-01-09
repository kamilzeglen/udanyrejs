import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as commonActions from './common.actions';
import * as commonSelectors from './common.selectors';


@Injectable()
export class CommonFacade {
  public companies$ = this.store.select(commonSelectors.selectCompanies);
  public ships$ = this.store.select(commonSelectors.selectShips);
  public destinations$ = this.store.select(commonSelectors.selectDestinations);
  public categories$ = this.store.select(commonSelectors.selectCategories);
  public loading$ = this.store.select(commonSelectors.selectLoading);

  public getCompanySuccess$ = this.actions.pipe(ofType(commonActions.getCompanySuccess));
  public getShipSuccess$ = this.actions.pipe(ofType(commonActions.getShipSuccess));
  public getCategoriesSuccess$ = this.actions.pipe(ofType(commonActions.getCategoriesSuccess));

  public createCompanySuccess$ = this.actions.pipe(ofType(commonActions.createCompanySuccess));
  public createShipSuccess$ = this.actions.pipe(ofType(commonActions.createShipSuccess));

  public updateCompanySuccess$ = this.actions.pipe(ofType(commonActions.updateCompanySuccess));
  public updateShipSuccess$ = this.actions.pipe(ofType(commonActions.updateShipSuccess));

  public deleteCompanySuccess$ = this.actions.pipe(ofType(commonActions.deleteCompanySuccess));
  public deleteShipSuccess$ = this.actions.pipe(ofType(commonActions.deleteShipSuccess));

  constructor(
    private store: Store<AppState>,
    private actions: Actions
  ) {
  }

  public getCompanies(): void {
    this.store.dispatch(commonActions.getCompanies());
  }

  public getCompany(payload: { id: string }): void {
    this.store.dispatch(commonActions.getCompany({payload}));
  }

  public createCompany(payload: { formData: FormData }): void {
    this.store.dispatch(commonActions.createCompany({payload}));
  }

  public updateCompany(payload: { id: string, formData: FormData }): void {
    this.store.dispatch(commonActions.updateCompany({payload}));
  }

  public deleteCompany(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteCompany({payload}));
  }

  public getShips(companyId: string): void {
    this.store.dispatch(commonActions.getShips({companyId}));
  }

  public getShip(payload: { id: string }): void {
    this.store.dispatch(commonActions.getShip({payload}));
  }

  public createShip(payload: { formData: FormData }): void {
    this.store.dispatch(commonActions.createShip({payload}));
  }

  public updateShip(payload: { id: string, formData: FormData }): void {
    this.store.dispatch(commonActions.updateShip({payload}));
  }

  public deleteShip(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteShip({payload}));
  }

  public getCategories(): void {
    this.store.dispatch(commonActions.getCategories());
  }

  public getDestinations(): void {
    this.store.dispatch(commonActions.getDestinations());
  }
}
