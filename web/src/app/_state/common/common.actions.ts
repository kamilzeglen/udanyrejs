import { createAction, props } from '@ngrx/store';
import { CabinType, Category, City, Company, Destination, Ship } from '@interfaces';
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

export const bulkDeleteCompanies = createAction(
  '[Common] Bulk Delete Companies',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeleteCompaniesSuccess = createAction(
  '[Common] Bulk Delete Companies Success',
  props<{ deletedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeleteCompaniesError = createAction(
  '[Common] Bulk Delete Companies Error',
  props<{ errorMessage: string }>(),
);

export const bulkActivateCompanies = createAction(
  '[Common] Bulk Activate Companies',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkActivateCompaniesSuccess = createAction(
  '[Common] Bulk Activate Companies Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkActivateCompaniesError = createAction(
  '[Common] Bulk Activate Companies Error',
  props<{ errorMessage: string }>(),
);

export const bulkDeactivateCompanies = createAction(
  '[Common] Bulk Deactivate Companies',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeactivateCompaniesSuccess = createAction(
  '[Common] Bulk Deactivate Companies Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeactivateCompaniesError = createAction(
  '[Common] Bulk Deactivate Companies Error',
  props<{ errorMessage: string }>(),
);

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

export const bulkDeleteShips = createAction('[Common] Bulk Delete Ships', props<{ payload: { ids: string[] } }>());
export const bulkDeleteShipsSuccess = createAction(
  '[Common] Bulk Delete Ships Success',
  props<{ deletedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeleteShipsError = createAction('[Common] Bulk Delete Ships Error', props<{ errorMessage: string }>());

export const bulkActivateShips = createAction('[Common] Bulk Activate Ships', props<{ payload: { ids: string[] } }>());
export const bulkActivateShipsSuccess = createAction(
  '[Common] Bulk Activate Ships Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkActivateShipsError = createAction(
  '[Common] Bulk Activate Ships Error',
  props<{ errorMessage: string }>(),
);

export const bulkDeactivateShips = createAction(
  '[Common] Bulk Deactivate Ships',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeactivateShipsSuccess = createAction(
  '[Common] Bulk Deactivate Ships Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeactivateShipsError = createAction(
  '[Common] Bulk Deactivate Ships Error',
  props<{ errorMessage: string }>(),
);

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

export const bulkDeleteCategories = createAction(
  '[Common] Bulk Delete Categories',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeleteCategoriesSuccess = createAction(
  '[Common] Bulk Delete Categories Success',
  props<{ deletedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeleteCategoriesError = createAction(
  '[Common] Bulk Delete Categories Error',
  props<{ errorMessage: string }>(),
);

export const bulkActivateCategories = createAction(
  '[Common] Bulk Activate Categories',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkActivateCategoriesSuccess = createAction(
  '[Common] Bulk Activate Categories Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkActivateCategoriesError = createAction(
  '[Common] Bulk Activate Categories Error',
  props<{ errorMessage: string }>(),
);

export const bulkDeactivateCategories = createAction(
  '[Common] Bulk Deactivate Categories',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeactivateCategoriesSuccess = createAction(
  '[Common] Bulk Deactivate Categories Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeactivateCategoriesError = createAction(
  '[Common] Bulk Deactivate Categories Error',
  props<{ errorMessage: string }>(),
);

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

export const bulkDeleteDestinations = createAction(
  '[Common] Bulk Delete Destinations',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeleteDestinationsSuccess = createAction(
  '[Common] Bulk Delete Destinations Success',
  props<{ deletedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeleteDestinationsError = createAction(
  '[Common] Bulk Delete Destinations Error',
  props<{ errorMessage: string }>(),
);

export const bulkActivateDestinations = createAction(
  '[Common] Bulk Activate Destinations',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkActivateDestinationsSuccess = createAction(
  '[Common] Bulk Activate Destinations Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkActivateDestinationsError = createAction(
  '[Common] Bulk Activate Destinations Error',
  props<{ errorMessage: string }>(),
);

export const bulkDeactivateDestinations = createAction(
  '[Common] Bulk Deactivate Destinations',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeactivateDestinationsSuccess = createAction(
  '[Common] Bulk Deactivate Destinations Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeactivateDestinationsError = createAction(
  '[Common] Bulk Deactivate Destinations Error',
  props<{ errorMessage: string }>(),
);

export const getCity = createAction('[Common] Get City', props<{ payload: { id: string } }>());
export const getCitySuccess = createAction('[Common] Get City Success', props<{ city: City }>());
export const getCityError = createAction('[Common] Get City Error', props<{ errorMessage: string }>());

export const getCities = createAction('[Common] Get Cities');
export const getCitiesSuccess = createAction('[Common] Get Cities Success', props<{ cities: City[] }>());
export const getCitiesError = createAction('[Common] Get Cities Error', props<{ errorMessage: string }>());

export const createCity = createAction('[Common] Create City', props<{ payload: { formData: Partial<City> } }>());
export const createCitySuccess = createAction('[Common] Create City Success', props<{ city: City }>());
export const createCityError = createAction('[Common] Create City Error', props<{ errorMessage: string }>());

export const updateCity = createAction(
  '[Common] Update City',
  props<{ payload: { id: string; formData: Partial<City> } }>(),
);
export const updateCitySuccess = createAction('[Common] Update City Success', props<{ city: City }>());
export const updateCityError = createAction('[Common] Update City Error', props<{ errorMessage: string }>());

export const deleteCity = createAction('[Common] Delete City', props<{ payload: { id: string } }>());
export const deleteCitySuccess = createAction('[Common] Delete City Success');
export const deleteCityError = createAction('[Common] Delete City Error', props<{ errorMessage: string }>());

export const bulkDeleteCities = createAction('[Common] Bulk Delete Cities', props<{ payload: { ids: string[] } }>());
export const bulkDeleteCitiesSuccess = createAction(
  '[Common] Bulk Delete Cities Success',
  props<{ deletedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeleteCitiesError = createAction(
  '[Common] Bulk Delete Cities Error',
  props<{ errorMessage: string }>(),
);

export const bulkActivateCities = createAction(
  '[Common] Bulk Activate Cities',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkActivateCitiesSuccess = createAction(
  '[Common] Bulk Activate Cities Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkActivateCitiesError = createAction(
  '[Common] Bulk Activate Cities Error',
  props<{ errorMessage: string }>(),
);

export const bulkDeactivateCities = createAction(
  '[Common] Bulk Deactivate Cities',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeactivateCitiesSuccess = createAction(
  '[Common] Bulk Deactivate Cities Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeactivateCitiesError = createAction(
  '[Common] Bulk Deactivate Cities Error',
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

export const bulkDeleteCabinTypes = createAction(
  '[Common] Bulk Delete Cabin Types',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeleteCabinTypesSuccess = createAction(
  '[Common] Bulk Delete Cabin Types Success',
  props<{ deletedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeleteCabinTypesError = createAction(
  '[Common] Bulk Delete Cabin Types Error',
  props<{ errorMessage: string }>(),
);

export const bulkActivateCabinTypes = createAction(
  '[Common] Bulk Activate Cabin Types',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkActivateCabinTypesSuccess = createAction(
  '[Common] Bulk Activate Cabin Types Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkActivateCabinTypesError = createAction(
  '[Common] Bulk Activate Cabin Types Error',
  props<{ errorMessage: string }>(),
);

export const bulkDeactivateCabinTypes = createAction(
  '[Common] Bulk Deactivate Cabin Types',
  props<{ payload: { ids: string[] } }>(),
);
export const bulkDeactivateCabinTypesSuccess = createAction(
  '[Common] Bulk Deactivate Cabin Types Success',
  props<{ updatedIds: string[]; failedIds: string[] }>(),
);
export const bulkDeactivateCabinTypesError = createAction(
  '[Common] Bulk Deactivate Cabin Types Error',
  props<{ errorMessage: string }>(),
);
