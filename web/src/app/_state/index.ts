import {CommonEffects, CommonFacade, commonReducer, CommonState} from '@state/common';
import {UsersEffects, UsersFacade, usersReducer, UsersState} from '@state/users';
import {AuthEffects, AuthFacade, authReducer, AuthState} from '@state/auth';
import {RouterEffects, RouterFacade, RouterStateUrl} from '@state/router';
import {OfferEffects, OfferFacade, offerReducer, OfferState} from 'src/app/_state/offer';

export const reducers = {
  users: usersReducer,
  offer: offerReducer,
  auth: authReducer,
  common: commonReducer,
}

export const effects = [
  UsersEffects,
  OfferEffects,
  RouterEffects,
  AuthEffects,
  CommonEffects,
]

export const facades = [
  UsersFacade,
  OfferFacade,
  AuthFacade,
  RouterFacade,
  CommonFacade,
]

export interface AppState {
  users: UsersState,
  offer: OfferState,
  auth: AuthState,
  router: RouterStateUrl,
  common: CommonState,
}
