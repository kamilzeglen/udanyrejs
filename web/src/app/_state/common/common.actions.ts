import {createAction, props} from '@ngrx/store';
import {Category, Company, Destination, Ship} from '@interfaces';
import {City} from '../../_interfaces/city';

export const getCompanies = createAction('[Common] Get Companies');
export const getCompaniesSuccess = createAction('[Common] Get Companies Success', props<{ companies: Company[] }>());
export const getCompaniesError = createAction('[Common] Get Companies Error', props<{ errorMessage: string }>());

export const getCompany = createAction('[Common] Get Company', props<{ payload: { id: string } }>());
export const getCompanySuccess = createAction('[Common] Get Company Success', props<{ company: Company }>());
export const getCompanyError = createAction('[Common] Get Company Error', props<{ errorMessage: string }>());

export const createCompany = createAction('[Common] Create Company', props<{ payload: { formData: Partial<Company> } }>());
export const createCompanySuccess = createAction('[Common] Create Company Success', props<{ company: Company }>());
export const createCompanyError = createAction('[Common] Create Company Error', props<{ errorMessage: string }>());

export const updateCompany = createAction('[Common] Update Company', props<{
  payload: { id: string, formData: Partial<Company> }
}>());
export const updateCompanySuccess = createAction('[Common] Update Company Success', props<{ company: Company }>());
export const updateCompanyError = createAction('[Common] Update Company Error', props<{ errorMessage: string }>());

export const deleteCompany = createAction('[Common] Delete Company', props<{ payload: { id: string }}>());
export const deleteCompanySuccess = createAction('[Common] Delete Company Success');
export const deleteCompanyError = createAction('[Common] Delete Company Error', props<{ errorMessage: string }>());

export const getShips = createAction('[Common] Get Ships', props<{ companyId: string }>());
export const getShipsSuccess = createAction('[Common] Get Ships Success', props<{ ships: Ship[] }>());
export const getShipsError = createAction('[Common] Get Ships Error', props<{ errorMessage: string }>());

export const getShipById = createAction('[Common] Get Ship By ID', props<{ payload: { id: string } }>());
export const getShipByIdSuccess = createAction('[Common] Get Ship By ID Success', props<{ ship: Ship }>());
export const getShipByIdError = createAction('[Common] Get Ship By ID Error', props<{ errorMessage: string }>());

export const getShipByName = createAction('[Common] Get Ship By Name', props<{ payload: { name: string } }>());
export const getShipByNameSuccess = createAction('[Common] Get Ship By Name Success', props<{ ship: Ship }>());
export const getShipByNameError = createAction('[Common] Get Ship By Name Error', props<{ errorMessage: string }>());

export const createShip = createAction('[Common] Create Ship', props<{ payload: { formData: FormData } }>());
export const createShipSuccess = createAction('[Common] Create Ship Success', props<{ ship: Ship }>());
export const createShipError = createAction('[Common] Ship Company Error', props<{ errorMessage: string }>());

export const updateShip = createAction('[Common] Update Ship', props<{
  payload: { id: string, formData: FormData }
}>());
export const updateShipSuccess = createAction('[Common] Update Ship Success', props<{ ship: Ship }>());
export const updateShipError = createAction('[Common] Update Ship Error', props<{ errorMessage: string }>());

export const deleteShip = createAction('[Common] Delete Ship', props<{ payload: { id: string }}>());
export const deleteShipSuccess = createAction('[Common] Delete Ship Success');
export const deleteShipError = createAction('[Common] Delete Ship Error', props<{ errorMessage: string }>());

export const getCategories = createAction('[Common] Get Categories');
export const getCategoriesSuccess = createAction('[Common] Get Categories Success', props<{
  categories: Category[]
}>());
export const getCategoriesError = createAction('[Common] Get Categories Error', props<{ errorMessage: string }>());

export const getDestinations = createAction('[Common] Get Destination');
export const getDestinationsSuccess = createAction('[Common] Get Destination Success', props<{
  destinations: Destination[]
}>());
export const getDestinationsError = createAction('[Common] Get Destination Error', props<{ errorMessage: string }>());

export const getCities = createAction('[Common] Get Cities')
export const getCitiesSuccess = createAction('[Common] Get Cities Success', props<{ cities: City[] }>());
export const getCitiesError = createAction('[Common] Get Cities Error', props<{ errorMessage: string }>());

export const createCity = createAction('[Common] Create City', props<{ payload: { formData: Partial<City> } }>());
export const createCitySuccess = createAction('[Common] Create City Success', props<{ city: City }>());
export const createCityError = createAction('[Common] Create City Error', props<{ errorMessage: string }>());

export const createCities = createAction('[Common] Create Cities', props<{ payload: { cities: string[] } }>());
export const createCitiesSuccess = createAction('[Common] Create Cities Success', props<{ cities: City[] }>());
export const createCitiesError = createAction('[Common] Create Cities Error', props<{ errorMessage: string }>());
