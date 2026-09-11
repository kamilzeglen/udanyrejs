import { createAction, props } from '@ngrx/store';
import { CabinType, Category, Company, Destination, Ship } from '@interfaces';
import { Log } from '../../_interfaces/log';

export const getCompanies = createAction('[Common] Get Companies');
export const getCompaniesSuccess = createAction('[Common] Get Companies Success', props<{ companies: Company[] }>());
export const getCompaniesError = createAction('[Common] Get Companies Error', props<{ errorMessage: string }>());

export const getCompany = createAction('[Common] Get Company', props<{ payload: { id: string } }>());
export const getCompanySuccess = createAction('[Common] Get Company Success', props<{ company: Company }>());
export const getCompanyError = createAction('[Common] Get Company Error', props<{ errorMessage: string }>());

export const createCompany = createAction(
  '[Common] Create Company',
  props<{ payload: { formData: Partial<Company> } }>(),
);
export const createCompanySuccess = createAction('[Common] Create Company Success', props<{ company: Company }>());
export const createCompanyError = createAction('[Common] Create Company Error', props<{ errorMessage: string }>());

export const updateCompany = createAction(
  '[Common] Update Company',
  props<{
    payload: { id: string; formData: Partial<Company> };
  }>(),
);
export const updateCompanySuccess = createAction('[Common] Update Company Success', props<{ company: Company }>());
export const updateCompanyError = createAction('[Common] Update Company Error', props<{ errorMessage: string }>());

export const deleteCompany = createAction('[Common] Delete Company', props<{ payload: { id: string } }>());
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

export const updateShip = createAction(
  '[Common] Update Ship',
  props<{
    payload: { id: string; formData: FormData };
  }>(),
);
export const updateShipSuccess = createAction('[Common] Update Ship Success', props<{ ship: Ship }>());
export const updateShipError = createAction('[Common] Update Ship Error', props<{ errorMessage: string }>());

export const deleteShip = createAction('[Common] Delete Ship', props<{ payload: { id: string } }>());
export const deleteShipSuccess = createAction('[Common] Delete Ship Success');
export const deleteShipError = createAction('[Common] Delete Ship Error', props<{ errorMessage: string }>());

export const getCategory = createAction('[Common] Get Category', props<{ payload: { id: string } }>());
export const getCategorySuccess = createAction('[Common] Get Category Success', props<{ category: Category }>());
export const getCategoryError = createAction('[Common] Get Category Error', props<{ errorMessage: string }>());

export const getCategories = createAction('[Common] Get Categories');
export const getCategoriesSuccess = createAction(
  '[Common] Get Categories Success',
  props<{
    categories: Category[];
  }>(),
);
export const getCategoriesError = createAction('[Common] Get Categories Error', props<{ errorMessage: string }>());

export const createCategory = createAction('[Common] Create Category', props<{ payload: { formData: FormData } }>());
export const createCategorySuccess = createAction('[Common] Create Category Success', props<{ category: Category }>());
export const createCategoryError = createAction('[Common] Create Category Error', props<{ errorMessage: string }>());

export const updateCategory = createAction(
  '[Common] Update Category',
  props<{
    payload: { id: string; formData: FormData };
  }>(),
);
export const updateCategorySuccess = createAction('[Common] Update Category Success', props<{ category: Category }>());
export const updateCategoryError = createAction('[Common] Update Category Error', props<{ errorMessage: string }>());

export const deleteCategory = createAction('[Common] Delete Category', props<{ payload: { id: string } }>());
export const deleteCategorySuccess = createAction('[Common] Delete Category Success');
export const deleteCategoryError = createAction('[Common] Delete Category Error', props<{ errorMessage: string }>());

export const getDestination = createAction('[Common] Get Destination', props<{ payload: { id: string } }>());
export const getDestinationSuccess = createAction(
  '[Common] Get Destination Success',
  props<{ destination: Destination }>(),
);
export const getDestinationError = createAction('[Common] Get Destination Error', props<{ errorMessage: string }>());

export const getDestinations = createAction('[Common] Get Destinations');
export const getDestinationsSuccess = createAction(
  '[Common] Get Destinations Success',
  props<{
    destinations: Destination[];
  }>(),
);
export const getDestinationsError = createAction('[Common] Get Destinations Error', props<{ errorMessage: string }>());

export const getLogs = createAction('[Common] Get Logs');
export const getLogsSuccess = createAction('[Common] Get Logs Success', props<{ logs: Log[] }>());
export const getLogsError = createAction('[Common] Get Logs Error', props<{ errorMessage: string }>());

export const createDestination = createAction(
  '[Common] Create Destination',
  props<{ payload: { formData: FormData } }>(),
);
export const createDestinationSuccess = createAction(
  '[Common] Create Destination Success',
  props<{ destination: Destination }>(),
);
export const createDestinationError = createAction(
  '[Common] Create Destination Error',
  props<{ errorMessage: string }>(),
);

export const updateDestination = createAction(
  '[Common] Update Destination',
  props<{
    payload: { id: string; formData: FormData };
  }>(),
);
export const updateDestinationSuccess = createAction(
  '[Common] Update Destination Success',
  props<{ destination: Destination }>(),
);
export const updateDestinationError = createAction(
  '[Common] Update Destination Error',
  props<{ errorMessage: string }>(),
);

export const deleteDestination = createAction('[Common] Delete Destination', props<{ payload: { id: string } }>());
export const deleteDestinationSuccess = createAction('[Common] Delete Destination Success');
export const deleteDestinationError = createAction(
  '[Common] Delete Destination Error',
  props<{ errorMessage: string }>(),
);

export const getCabinTypes = createAction('[Common] Get Cabin Types', props<{ companyId: string }>());
export const getCabinTypesSuccess = createAction(
  '[Common] Get Cabin Types Success',
  props<{ cabinTypes: CabinType[] }>(),
);
export const getCabinTypesError = createAction('[Common] Get Cabin Types Error', props<{ errorMessage: string }>());

export const getAllCabinTypes = createAction('[Common] Get All Cabin Types');
export const getAllCabinTypesSuccess = createAction(
  '[Common] Get All Cabin Types Success',
  props<{ cabinTypes: CabinType[] }>(),
);
export const getAllCabinTypesError = createAction(
  '[Common] Get All Cabin Types Error',
  props<{ errorMessage: string }>(),
);

export const createCabinType = createAction('[Common] Create Cabin Type', props<{ payload: { formData: FormData } }>());
export const createCabinTypeSuccess = createAction(
  '[Common] Create Cabin Type Success',
  props<{ cabinType: CabinType }>(),
);
export const createCabinTypeError = createAction('[Common] Create Cabin Type Error', props<{ errorMessage: string }>());

export const updateCabinType = createAction(
  '[Common] Update Cabin Type',
  props<{ payload: { id: string; formData: FormData } }>(),
);
export const updateCabinTypeSuccess = createAction(
  '[Common] Update Cabin Type Success',
  props<{ cabinType: CabinType }>(),
);
export const updateCabinTypeError = createAction('[Common] Update Cabin Type Error', props<{ errorMessage: string }>());

export const deleteCabinType = createAction('[Common] Delete Cabin Type', props<{ payload: { id: string } }>());
export const deleteCabinTypeSuccess = createAction('[Common] Delete Cabin Type Success');
export const deleteCabinTypeError = createAction('[Common] Delete Cabin Type Error', props<{ errorMessage: string }>());
