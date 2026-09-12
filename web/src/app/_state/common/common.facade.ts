import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@state';
import * as commonActions from './common.actions';
import * as commonSelectors from './common.selectors';
import { Category, City, Company } from '@interfaces';
import { filter, map, Observable, tap } from 'rxjs';

@Injectable()
export class CommonFacade {
  public companies$ = this.store.select(commonSelectors.selectCompanies);
  public ships$ = this.store.select(commonSelectors.selectShips);
  public destinations$ = this.store.select(commonSelectors.selectDestinations);
  public cities$ = this.store.select(commonSelectors.selectCities);
  public categories$ = this.store.select(commonSelectors.selectCategories);
  public logs$ = this.store.select(commonSelectors.selectLogs);
  public cabinTypes$ = this.store.select(commonSelectors.selectCabinTypes);
  public cabinTypesGroupedByCompany$ = this.store.select(commonSelectors.selectCabinTypesGroupedByCompany);
  public loading$ = this.store.select(commonSelectors.selectLoading);

  public getShipsSuccess$ = this.actions.pipe(ofType(commonActions.getShipsSuccess));
  public getShipsError$ = this.actions.pipe(ofType(commonActions.getShipsError));
  public getShipByNameSuccess$ = this.actions.pipe(ofType(commonActions.getShipByNameSuccess));
  public getShipByNameError$ = this.actions.pipe(ofType(commonActions.getShipByNameError));
  public getShipByIdSuccess$ = this.actions.pipe(ofType(commonActions.getShipByIdSuccess));
  public getShipByIdError$ = this.actions.pipe(ofType(commonActions.getShipByIdError));
  public createShipSuccess$ = this.actions.pipe(ofType(commonActions.createShipSuccess));
  public createShipError$ = this.actions.pipe(ofType(commonActions.createShipError));
  public updateShipSuccess$ = this.actions.pipe(ofType(commonActions.updateShipSuccess));
  public updateShipError$ = this.actions.pipe(ofType(commonActions.updateShipError));
  public deleteShipSuccess$ = this.actions.pipe(ofType(commonActions.deleteShipSuccess));

  public getCompanySuccess$ = this.actions.pipe(ofType(commonActions.getCompanySuccess));
  public getCompanyError$ = this.actions.pipe(ofType(commonActions.getCompanyError));
  public getCompaniesSuccess$ = this.actions.pipe(ofType(commonActions.getCompaniesSuccess));
  public getCompaniesError$ = this.actions.pipe(ofType(commonActions.getCompaniesError));
  public createCompanySuccess$ = this.actions.pipe(ofType(commonActions.createCompanySuccess));
  public createCompanyError$ = this.actions.pipe(ofType(commonActions.createCompanyError));
  public updateCompanySuccess$ = this.actions.pipe(ofType(commonActions.updateCompanySuccess));
  public updateCompanyError$ = this.actions.pipe(ofType(commonActions.updateCompanyError));
  public deleteCompanySuccess$ = this.actions.pipe(ofType(commonActions.deleteCompanySuccess));
  public deleteCompanyError$ = this.actions.pipe(ofType(commonActions.deleteCompanyError));

  public getCategoriesSuccess$ = this.actions.pipe(ofType(commonActions.getCategoriesSuccess));
  public getCategoriesError$ = this.actions.pipe(ofType(commonActions.getCategoriesError));
  public getCategorySuccess$ = this.actions.pipe(ofType(commonActions.getCategorySuccess));
  public getCategoryError$ = this.actions.pipe(ofType(commonActions.getCategoryError));
  public createCategorySuccess$ = this.actions.pipe(ofType(commonActions.createCategorySuccess));
  public createCategoryError$ = this.actions.pipe(ofType(commonActions.createCategoryError));
  public updateCategorySuccess$ = this.actions.pipe(ofType(commonActions.updateCategorySuccess));
  public updateCategoryError$ = this.actions.pipe(ofType(commonActions.updateCategoryError));
  public deleteCategorySuccess$ = this.actions.pipe(ofType(commonActions.deleteCategorySuccess));
  public deleteCategoryError$ = this.actions.pipe(ofType(commonActions.deleteCategoryError));

  public getDestinationsSuccess$ = this.actions.pipe(ofType(commonActions.getDestinationsSuccess));
  public getDestinationsError$ = this.actions.pipe(ofType(commonActions.getDestinationsError));
  public getDestinationSuccess$ = this.actions.pipe(ofType(commonActions.getDestinationSuccess));
  public getDestinationError$ = this.actions.pipe(ofType(commonActions.getDestinationError));
  public createDestinationSuccess$ = this.actions.pipe(ofType(commonActions.createDestinationSuccess));
  public createDestinationError$ = this.actions.pipe(ofType(commonActions.createDestinationError));
  public updateDestinationSuccess$ = this.actions.pipe(ofType(commonActions.updateDestinationSuccess));
  public updateDestinationError$ = this.actions.pipe(ofType(commonActions.updateDestinationError));
  public deleteDestinationSuccess$ = this.actions.pipe(ofType(commonActions.deleteDestinationSuccess));
  public deleteDestinationError$ = this.actions.pipe(ofType(commonActions.deleteDestinationError));

  public getCitiesSuccess$ = this.actions.pipe(ofType(commonActions.getCitiesSuccess));
  public getCitiesError$ = this.actions.pipe(ofType(commonActions.getCitiesError));
  public getCitySuccess$ = this.actions.pipe(ofType(commonActions.getCitySuccess));
  public getCityError$ = this.actions.pipe(ofType(commonActions.getCityError));
  public createCitySuccess$ = this.actions.pipe(ofType(commonActions.createCitySuccess));
  public createCityError$ = this.actions.pipe(ofType(commonActions.createCityError));
  public updateCitySuccess$ = this.actions.pipe(ofType(commonActions.updateCitySuccess));
  public updateCityError$ = this.actions.pipe(ofType(commonActions.updateCityError));
  public deleteCitySuccess$ = this.actions.pipe(ofType(commonActions.deleteCitySuccess));
  public deleteCityError$ = this.actions.pipe(ofType(commonActions.deleteCityError));

  public getLogsSuccess$ = this.actions.pipe(ofType(commonActions.getLogsSuccess));
  public getLogsError$ = this.actions.pipe(ofType(commonActions.getLogsError));

  public getCabinTypesSuccess$ = this.actions.pipe(ofType(commonActions.getCabinTypesSuccess));
  public getCabinTypesError$ = this.actions.pipe(ofType(commonActions.getCabinTypesError));
  public getAllCabinTypesSuccess$ = this.actions.pipe(ofType(commonActions.getAllCabinTypesSuccess));
  public getAllCabinTypesError$ = this.actions.pipe(ofType(commonActions.getAllCabinTypesError));
  public createCabinTypeSuccess$ = this.actions.pipe(ofType(commonActions.createCabinTypeSuccess));
  public createCabinTypeError$ = this.actions.pipe(ofType(commonActions.createCabinTypeError));
  public updateCabinTypeSuccess$ = this.actions.pipe(ofType(commonActions.updateCabinTypeSuccess));
  public updateCabinTypeError$ = this.actions.pipe(ofType(commonActions.updateCabinTypeError));
  public deleteCabinTypeSuccess$ = this.actions.pipe(ofType(commonActions.deleteCabinTypeSuccess));
  public deleteCabinTypeError$ = this.actions.pipe(ofType(commonActions.deleteCabinTypeError));

  constructor(
    private store: Store<AppState>,
    private actions: Actions,
  ) {}

  public getCompanies(): void {
    this.store.dispatch(commonActions.getCompanies());
  }

  public getCompany(payload: { id: string }): void {
    this.store.dispatch(commonActions.getCompany({ payload }));
  }

  public createCompany(payload: { formData: Partial<Company> }): void {
    this.store.dispatch(commonActions.createCompany({ payload }));
  }

  public updateCompany(payload: { id: string; formData: Partial<Company> }): void {
    this.store.dispatch(commonActions.updateCompany({ payload }));
  }

  public deleteCompany(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteCompany({ payload }));
  }

  public getShips(companyId: string): void {
    this.store.dispatch(commonActions.getShips({ companyId }));
  }

  public getShipById(payload: { id: string }): void {
    this.store.dispatch(commonActions.getShipById({ payload }));
  }

  public getShipByName(payload: { name: string }): void {
    this.store.dispatch(commonActions.getShipByName({ payload }));
  }

  public createShip(payload: { formData: FormData }): void {
    this.store.dispatch(commonActions.createShip({ payload }));
  }

  public updateShip(payload: { id: string; formData: FormData }): void {
    this.store.dispatch(commonActions.updateShip({ payload }));
  }

  public deleteShip(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteShip({ payload }));
  }

  public getCategory(payload: { id: string }): void {
    this.store.dispatch(commonActions.getCategory({ payload }));
  }

  public getCategories(): void {
    this.store.dispatch(commonActions.getCategories());
  }

  public createCategory(payload: { formData: FormData }): void {
    this.store.dispatch(commonActions.createCategory({ payload }));
  }

  public updateCategory(payload: { id: string; formData: FormData }): void {
    this.store.dispatch(commonActions.updateCategory({ payload }));
  }

  public deleteCategory(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteCategory({ payload }));
  }

  // categories === null oznacza "jeszcze nie pobrano" - dopiero wtedy dociągamy dane.
  // Po błędzie reducer ustawia categories na [] (nie null), więc warunek nie jest
  // już spełniony i nie próbujemy pobierać ponownie w kółko przy każdej awarii serwera.
  public getCategories$(): Observable<Category[]> {
    return this.store.select(commonSelectors.selectCommonState).pipe(
      tap((state) => {
        if (state.categories === null && state.loading === false) {
          this.getCategories();
        }
      }),
      map((state) => state.categories),
      filter((categories) => categories !== null && categories.length > 0),
    );
  }

  public getDestinations(): void {
    this.store.dispatch(commonActions.getDestinations());
  }

  public getDestination(payload: { id: string }): void {
    this.store.dispatch(commonActions.getDestination({ payload }));
  }

  public createDestination(payload: { formData: FormData }): void {
    this.store.dispatch(commonActions.createDestination({ payload }));
  }

  public updateDestination(payload: { id: string; formData: FormData }): void {
    this.store.dispatch(commonActions.updateDestination({ payload }));
  }

  public deleteDestination(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteDestination({ payload }));
  }

  public getCities(): void {
    this.store.dispatch(commonActions.getCities());
  }

  public getCity(payload: { id: string }): void {
    this.store.dispatch(commonActions.getCity({ payload }));
  }

  public createCity(payload: { formData: Partial<City> }): void {
    this.store.dispatch(commonActions.createCity({ payload }));
  }

  public updateCity(payload: { id: string; formData: Partial<City> }): void {
    this.store.dispatch(commonActions.updateCity({ payload }));
  }

  public deleteCity(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteCity({ payload }));
  }

  public getLogs(): void {
    this.store.dispatch(commonActions.getLogs());
  }

  public getCabinTypes(companyId: string): void {
    this.store.dispatch(commonActions.getCabinTypes({ companyId }));
  }

  public getAllCabinTypes(): void {
    this.store.dispatch(commonActions.getAllCabinTypes());
  }

  public createCabinType(payload: { formData: FormData }): void {
    this.store.dispatch(commonActions.createCabinType({ payload }));
  }

  public updateCabinType(payload: { id: string; formData: FormData }): void {
    this.store.dispatch(commonActions.updateCabinType({ payload }));
  }

  public deleteCabinType(payload: { id: string }): void {
    this.store.dispatch(commonActions.deleteCabinType({ payload }));
  }
}
