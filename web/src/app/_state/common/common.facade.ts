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
  public bulkDeleteShipsSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeleteShipsSuccess));
  public bulkDeleteShipsError$ = this.actions.pipe(ofType(commonActions.bulkDeleteShipsError));
  public bulkActivateShipsSuccess$ = this.actions.pipe(ofType(commonActions.bulkActivateShipsSuccess));
  public bulkActivateShipsError$ = this.actions.pipe(ofType(commonActions.bulkActivateShipsError));
  public bulkDeactivateShipsSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeactivateShipsSuccess));
  public bulkDeactivateShipsError$ = this.actions.pipe(ofType(commonActions.bulkDeactivateShipsError));

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
  public bulkDeleteCompaniesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeleteCompaniesSuccess));
  public bulkDeleteCompaniesError$ = this.actions.pipe(ofType(commonActions.bulkDeleteCompaniesError));
  public bulkActivateCompaniesSuccess$ = this.actions.pipe(ofType(commonActions.bulkActivateCompaniesSuccess));
  public bulkActivateCompaniesError$ = this.actions.pipe(ofType(commonActions.bulkActivateCompaniesError));
  public bulkDeactivateCompaniesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCompaniesSuccess));
  public bulkDeactivateCompaniesError$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCompaniesError));

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
  public bulkDeleteCategoriesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeleteCategoriesSuccess));
  public bulkDeleteCategoriesError$ = this.actions.pipe(ofType(commonActions.bulkDeleteCategoriesError));
  public bulkActivateCategoriesSuccess$ = this.actions.pipe(ofType(commonActions.bulkActivateCategoriesSuccess));
  public bulkActivateCategoriesError$ = this.actions.pipe(ofType(commonActions.bulkActivateCategoriesError));
  public bulkDeactivateCategoriesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCategoriesSuccess));
  public bulkDeactivateCategoriesError$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCategoriesError));

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
  public bulkDeleteDestinationsSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeleteDestinationsSuccess));
  public bulkDeleteDestinationsError$ = this.actions.pipe(ofType(commonActions.bulkDeleteDestinationsError));
  public bulkActivateDestinationsSuccess$ = this.actions.pipe(ofType(commonActions.bulkActivateDestinationsSuccess));
  public bulkActivateDestinationsError$ = this.actions.pipe(ofType(commonActions.bulkActivateDestinationsError));
  public bulkDeactivateDestinationsSuccess$ = this.actions.pipe(
    ofType(commonActions.bulkDeactivateDestinationsSuccess),
  );
  public bulkDeactivateDestinationsError$ = this.actions.pipe(ofType(commonActions.bulkDeactivateDestinationsError));

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
  public bulkDeleteCitiesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeleteCitiesSuccess));
  public bulkDeleteCitiesError$ = this.actions.pipe(ofType(commonActions.bulkDeleteCitiesError));
  public bulkActivateCitiesSuccess$ = this.actions.pipe(ofType(commonActions.bulkActivateCitiesSuccess));
  public bulkActivateCitiesError$ = this.actions.pipe(ofType(commonActions.bulkActivateCitiesError));
  public bulkDeactivateCitiesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCitiesSuccess));
  public bulkDeactivateCitiesError$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCitiesError));

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
  public bulkDeleteCabinTypesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeleteCabinTypesSuccess));
  public bulkDeleteCabinTypesError$ = this.actions.pipe(ofType(commonActions.bulkDeleteCabinTypesError));
  public bulkActivateCabinTypesSuccess$ = this.actions.pipe(ofType(commonActions.bulkActivateCabinTypesSuccess));
  public bulkActivateCabinTypesError$ = this.actions.pipe(ofType(commonActions.bulkActivateCabinTypesError));
  public bulkDeactivateCabinTypesSuccess$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCabinTypesSuccess));
  public bulkDeactivateCabinTypesError$ = this.actions.pipe(ofType(commonActions.bulkDeactivateCabinTypesError));

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

  public bulkDeleteCompanies(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeleteCompanies({ payload }));
  }

  public bulkActivateCompanies(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkActivateCompanies({ payload }));
  }

  public bulkDeactivateCompanies(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeactivateCompanies({ payload }));
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

  public bulkDeleteShips(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeleteShips({ payload }));
  }

  public bulkActivateShips(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkActivateShips({ payload }));
  }

  public bulkDeactivateShips(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeactivateShips({ payload }));
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

  public bulkDeleteCategories(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeleteCategories({ payload }));
  }

  public bulkActivateCategories(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkActivateCategories({ payload }));
  }

  public bulkDeactivateCategories(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeactivateCategories({ payload }));
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

  public bulkDeleteDestinations(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeleteDestinations({ payload }));
  }

  public bulkActivateDestinations(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkActivateDestinations({ payload }));
  }

  public bulkDeactivateDestinations(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeactivateDestinations({ payload }));
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

  public bulkDeleteCities(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeleteCities({ payload }));
  }

  public bulkActivateCities(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkActivateCities({ payload }));
  }

  public bulkDeactivateCities(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeactivateCities({ payload }));
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

  public bulkDeleteCabinTypes(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeleteCabinTypes({ payload }));
  }

  public bulkActivateCabinTypes(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkActivateCabinTypes({ payload }));
  }

  public bulkDeactivateCabinTypes(payload: { ids: string[] }): void {
    this.store.dispatch(commonActions.bulkDeactivateCabinTypes({ payload }));
  }
}
