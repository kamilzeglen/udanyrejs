import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import * as commonActions from '@state/common/common.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CommonHttpService} from '@core/_http/common.http.service';

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

  getCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getCompany),
      switchMap(({payload}) => {
        return this.http.getCompany(payload).pipe(
          map(company => {
            return commonActions.getCompanySuccess({company});
          }),
          catchError(errorMessage => {
            return of(commonActions.getCompanyError({errorMessage}));
          })
        );
      })
    )
  );

  createOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.createCompany),
      switchMap(({payload}) => {
        return this.http.createCompany(payload).pipe(
          map((company) => {
            return commonActions.createCompanySuccess({company});
          }),
          catchError(errorMessage => {
            return of(commonActions.createCompanyError({errorMessage}));
          })
        );
      })
    )
  )

  updateOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.updateCompany),
      switchMap(({payload}) => {
        return this.http.updateCompany(payload).pipe(
          map((company) => {
            return commonActions.updateCompanySuccess({company});
          }),
          catchError(errorMessage => {
            return of(commonActions.updateCompanyError({errorMessage}));
          })
        );
      })
    )
  )

  deleteOffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.deleteCompany),
      switchMap(({payload}) => {
        return this.http.deleteOffer(payload).pipe(
          map(() => {
            return commonActions.deleteCompanySuccess();
          }),
          catchError(errorMessage => {
            return of(commonActions.deleteCompanyError({errorMessage}));
          })
        );
      })
    )
  )


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

  getShipById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getShipById),
      switchMap(({payload}) => {
        return this.http.getShipById(payload).pipe(
          map(ship => {
            return commonActions.getShipByIdSuccess({ship});
          }),
          catchError(errorMessage => {
            return of(commonActions.getShipByIdError({errorMessage}));
          })
        );
      })
    )
  )

  getShipByName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getShipByName),
      switchMap(({payload}) => {
        return this.http.getShipByName(payload).pipe(
          map(ship => {
            return commonActions.getShipByNameSuccess({ship});
          }),
          catchError(errorMessage => {
            return of(commonActions.getShipByNameError({errorMessage}));
          })
        );
      })
    )
  )

  createShip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.createShip),
      switchMap(({payload}) => {
        return this.http.createShip(payload).pipe(
          map((ship) => {
            return commonActions.createShipSuccess({ship});
          }),
          catchError(errorMessage => {
            return of(commonActions.createShipError({errorMessage}));
          })
        );
      })
    )
  )

  updateShip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.updateShip),
      switchMap(({payload}) => {
        return this.http.updateShip(payload).pipe(
          map((ship) => {
            return commonActions.updateShipSuccess({ship});
          }),
          catchError(errorMessage => {
            return of(commonActions.updateShipError({errorMessage}));
          })
        );
      })
    )
  )

  deleteShip$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.deleteShip),
      switchMap(({payload}) => {
        return this.http.deleteShip(payload).pipe(
          map(() => {
            return commonActions.deleteShipSuccess();
          }),
          catchError(errorMessage => {
            return of(commonActions.deleteShipError({errorMessage}));
          })
        );
      })
    )
  )

  getCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getCategories),
      switchMap(() => {
        return this.http.getCategories().pipe(
          map(categories => {
            return commonActions.getCategoriesSuccess({categories});
          }),
          catchError(errorMessage => {
            return of(commonActions.getCategoriesError({errorMessage}));
          })
        );
      })
    )
  )

  getDestinations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getDestinations),
      switchMap(() => {
        return this.http.getDestinations().pipe(
          map(destinations => {
            return commonActions.getDestinationsSuccess({destinations});
          }),
          catchError(errorMessage => {
            return of(commonActions.getDestinationsError({errorMessage}));
          })
        );
      })
    )
  )

  getCities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.getCities),
      switchMap(() => {
        return this.http.getCities().pipe(
          map(cities => {
            return commonActions.getCitiesSuccess({cities});
          }),
          catchError(errorMessage => {
            return of(commonActions.getCitiesError({errorMessage}));
          })
        );
      })
    )
  )

  createCity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.createCity),
      switchMap(({payload}) => {
        return this.http.createCity(payload).pipe(
          map((city) => {
            return commonActions.createCitySuccess({city});
          }),
          catchError(errorMessage => {
            return of(commonActions.createCityError({errorMessage}));
          })
        );
      })
    )
  )

  createCities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(commonActions.createCities),
      switchMap(({payload}) => {
        return this.http.createCities(payload).pipe(
          map((cities) => {
            return commonActions.createCitiesSuccess({cities});
          }),
          catchError(errorMessage => {
            return of(commonActions.createCitiesError({errorMessage}));
          })
        );
      })
    )
  )

}
