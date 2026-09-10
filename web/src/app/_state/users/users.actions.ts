import { createAction, props } from '@ngrx/store';
import { User } from '@interfaces';

export const getUsers = createAction('[Users] Get Users');
export const getUsersSuccess = createAction('[Users] Get Users Success', props<{ users: User[] }>());
export const getUsersError = createAction('[Users] Get Users Error', props<{ errorMessage: string }>());
