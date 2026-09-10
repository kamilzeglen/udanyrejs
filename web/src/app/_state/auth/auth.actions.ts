import { createAction, props } from '@ngrx/store';
import { User } from '@interfaces';

export const getMyself = createAction('[User-Auth] Get Myself', props<{ redirect?: string }>());
export const getMyselfSuccess = createAction('[User-Auth] Get Myself Success', props<{ user: User }>());
export const getMyselfError = createAction('[User-Auth] Get Myself Error', props<{ redirect?: string; error: any }>());

export const login = createAction(
  '[Auth] Login',
  props<{ payload: { email: string; password: string }; redirect: string | null }>(),
);
export const loginSuccess = createAction('[Auth] Login Success', props<{ redirect: string | null }>());
export const loginError = createAction('[Auth] Login Error', props<{ errorMessage: string }>());
