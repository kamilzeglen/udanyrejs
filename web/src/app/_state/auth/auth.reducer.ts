import { initialState, AuthState } from './auth.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as authActions from '@state/auth/auth.actions';

const reducer = createReducer(
  initialState,

  on(authActions.getMyself, (state) => ({ ...state, loading: true })),
  on(authActions.getMyselfSuccess, (state, { user }) => ({ ...state, loading: false, myself: user })),
  on(authActions.getMyselfError, (state) => ({
    ...state,
    myself: null,
    loading: false,
  })),

  on(authActions.login, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
  })),
  on(authActions.loginSuccess, (state) => ({
    ...state,
    loading: false,
    errorMessage: null,
  })),
  on(authActions.loginError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    myself: null,
    errorMessage,
  })),
);

export function authReducer(state: AuthState | undefined, action: Action): AuthState {
  return reducer(state, action);
}
