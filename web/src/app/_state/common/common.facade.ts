import {Injectable} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {AppState} from '@state';
import * as commonActions from './common.actions';
import * as commonSelectors from './common.selectors';
import {Category, Company} from '@interfaces';
import {filter, Observable, tap} from 'rxjs';


@Injectable()
export class CommonFacade {
  public companies$ = this.store.select(commonSelectors.selectCompanies);
  public ships$ = this.store.select(commonSelectors.selectShips);
  public destinations$ = this.store.select(commonSelectors.selectDestinations);
  public categories$ = this.store.select(commonSelectors.selectCategories);
  public loading$ = this.store.select(commonSelectors.selectLoading);

  public getCompanySuccess$ = this.actions.pipe(ofType(commonActions.getCompanySuccess));
  public getShipByNameSuccess$ = this.actions.pipe(ofType(commonActions.getShipByNameSuccess));
  public getShipByIdSuccess$ = this.actions.pipe(ofType(commonActions.getShipByIdSuccess));
  public getCategoriesSuccess$ = this.actions.pipe(ofType(commonActions.getCategoriesSuccess));

  public createCompanySuccess$ = this.actions.pipe(ofType(commonActions.createCompanySuccess));
  public createCompanyError$ = this.actions.pipe(ofType(commonActions.createCompanyError));
  public createShipSuccess$ = this.actions.pipe(ofType(commonActions.createShipSuccess));
  public createShipError$ = this.actions.pipe(ofType(commonActions.createShipError));

  public updateCompanySuccess$ = this.actions.pipe(ofType(commonActions.updateCompanySuccess));
  public updateCompanyError$ = this.actions.pipe(ofType(commonActions.updateCompanyError));
  public updateShipSuccess$ = this.actions.pipe(ofType(commonActions.updateShipSuccess));
  public updateShipError$ = this.actions.pipe(ofType(commonActions.updateShipError));

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

  public createCompany(payload: { formData: Partial<Company> }): void {
    this.store.dispatch(commonActions.createCompany({payload}));
  }

  public updateCompany(payload: { id: string, formData: Partial<Company> }): void {
    this.store.dispatch(commonActions.updateCompany({payload}));
  }

  public deleteCompany(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteCompany({payload}));
  }

  public getShips(companyId: string): void {
    this.store.dispatch(commonActions.getShips({companyId}));
  }

  public getShipById(payload: { id: string }): void {
    this.store.dispatch(commonActions.getShipById({payload}));
  }

  public getShipByName(payload: { name: string }): void {
    this.store.dispatch(commonActions.getShipByName({payload}));
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

  public getCategories$(): Observable<Category[]> {
    return this.store.select(commonSelectors.selectCategories).pipe(
      tap(categories => {
        if (!categories || !categories.length) {
          this.getCategories();
        }
      }),
      filter(categories => {
        if (categories === null || !categories.length) {
          return false;
        }
        return true;
      })
    );
  }

  public getDestinations(): void {
    this.store.dispatch(commonActions.getDestinations());
  }
}
