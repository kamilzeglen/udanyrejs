import { CommonState, initialState } from './common.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as commonActions from '@state/common/common.actions';

const reducer = createReducer(
  initialState,

  on(commonActions.getCompanies, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    companies: [],
  })),
  on(commonActions.getCompaniesSuccess, (state, { companies }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    companies,
  })),
  on(commonActions.getCompaniesError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    companies: [],
  })),

  on(commonActions.getShips, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    ships: [],
  })),
  on(commonActions.getShipsSuccess, (state, { ships }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    ships,
  })),
  on(commonActions.getShipsError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    ships: [],
  })),

  on(commonActions.getCategories, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
  })),
  on(commonActions.getCategoriesSuccess, (state, { categories }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    categories,
  })),
  on(commonActions.getCategoriesError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    categories: [],
  })),

  on(commonActions.getDestinations, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    destinations: [],
  })),
  on(commonActions.getDestinationsSuccess, (state, { destinations }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    destinations,
  })),
  on(commonActions.getDestinationsError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    destinations: [],
  })),

  on(commonActions.getLogs, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    logs: [],
  })),
  on(commonActions.getLogsSuccess, (state, { logs }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    logs,
  })),
  on(commonActions.getLogsError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    logs: [],
  })),
);

export function commonReducer(state: CommonState | undefined, action: Action): CommonState {
  return reducer(state, action);
}
