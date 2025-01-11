import {CommonEffects, CommonFacade, commonReducer, CommonState} from '@state/common';
import {UsersEffects, UsersFacade, usersReducer, UsersState} from '@state/users';
import {AuthEffects, AuthFacade, authReducer, AuthState} from '@state/auth';
import {RouterEffects, RouterFacade, RouterStateUrl} from '@state/router';
import {OfferEffects, OfferFacade, offerReducer, OfferState} from 'src/app/_state/offer';
import {ImageFileEffects, ImageFileFacade, imageFileReducer, ImageFileState} from '@state/imageFile';

export const reducers = {
  users: usersReducer,
  offer: offerReducer,
  auth: authReducer,
  common: commonReducer,
  imageFile: imageFileReducer,
}

export const effects = [
  UsersEffects,
  OfferEffects,
  RouterEffects,
  AuthEffects,
  CommonEffects,
  ImageFileEffects,
]

export const facades = [
  UsersFacade,
  OfferFacade,
  AuthFacade,
  RouterFacade,
  CommonFacade,
  ImageFileFacade,
]

export interface AppState {
  users: UsersState,
  offer: OfferState,
  auth: AuthState,
  router: RouterStateUrl,
  common: CommonState,
  imageFile: ImageFileState,
}
