import { initialState, DiscoverState } from './discover.state';
import { Action, createReducer, on } from '@ngrx/store';
import * as discoverActions from '@state/discover/discover.actions';

const reducer = createReducer(
  initialState,

  on(discoverActions.startDiscovery, (state) => ({
    ...state,
    starting: true,
    errorMessage: null,
  })),
  on(discoverActions.startDiscoverySuccess, (state) => ({
    ...state,
    starting: false,
  })),
  on(discoverActions.startDiscoveryError, (state, { errorMessage }) => ({
    ...state,
    starting: false,
    errorMessage,
  })),

  on(discoverActions.getDraftsSuccess, (state, { drafts }) => ({
    ...state,
    drafts,
  })),
  on(discoverActions.deleteDraftSuccess, (state) => ({
    ...state,
  })),
);

export function discoverReducer(state: DiscoverState | undefined, action: Action): DiscoverState {
  return reducer(state, action);
}
