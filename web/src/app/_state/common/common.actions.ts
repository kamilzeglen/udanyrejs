import {createAction, props} from '@ngrx/store';
import {Company} from '@interfaces';

export const getCompanies = createAction('[Common] Get Companies');
export const getCompaniesSuccess = createAction('[Common] Get Companies Success', props<{ companies: Company[] }>());
export const getCompaniesError = createAction('[Common] Get Companies Error', props<{ errorMessage: string }>());
