import {initialState, CommonState} from './common.state';
import {Action, createReducer, on} from '@ngrx/store';
import * as commonActions from '@state/common/common.actions';


const reducer = createReducer(
  initialState,

  on(commonActions.getCompanies, state => ({
    ...state,
    loading: true,
    errorMessage: null,
    companies: [],
  })),
  on(commonActions.getCompaniesSuccess, (state, {companies}) => ({
    ...state,
    loading: false,
    errorMessage: null,
    companies
  })),
  on(commonActions.getCompaniesError, (state, {errorMessage}) => ({
    ...state,
    loading: false,
    errorMessage,
    companies: [],
  })),
)

export function commonReducer(state: CommonState | undefined, action: Action): CommonState {
  return reducer(state, action);
}
