import {createAction, props} from '@ngrx/store';
import {Company} from '@interfaces';
import {Ship} from '@interfaces';

export const getCompanies = createAction('[Common] Get Companies');
export const getCompaniesSuccess = createAction('[Common] Get Companies Success', props<{ companies: Company[] }>());
export const getCompaniesError = createAction('[Common] Get Companies Error', props<{ errorMessage: string }>());


export const getShips = createAction('[Common] Get Ships', props<{ companyId: string }>());
export const getShipsSuccess = createAction('[Common] Get Ships Success', props<{ ships: Ship[] }>());
export const getShipsError = createAction('[Common] Get Ships Error', props<{ errorMessage: string }>());
