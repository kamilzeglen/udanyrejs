import { initialState, UsersState } from './users.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as usersActions from '@state/users/users.actions';

const reducer = createReducer(
  initialState,

  on(usersActions.getUsers, (state) => ({
    ...state,
    loading: true,
    errorMessage: null,
    users: [],
  })),
  on(usersActions.getUsersSuccess, (state, { users }) => ({
    ...state,
    loading: false,
    errorMessage: null,
    users,
  })),
  on(usersActions.getUsersError, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
    users: [],
  })),
);

export function usersReducer(state: UsersState | undefined, action: Action): UsersState {
  return reducer(state, action);
}
