import {CommonEffects, CommonFacade, commonReducer, CommonState} from '@state/common';
import {UsersEffects, UsersFacade, usersReducer, UsersState} from '@state/users';
import {AuthEffects, AuthFacade, authReducer, AuthState} from '@state/auth';
import {RouterEffects, RouterFacade, RouterStateUrl} from '@state/router';
import {OfferEffects, OfferFacade, offerReducer, OfferState} from 'src/app/_state/offer';
import {ImageFileEffects, ImageFileFacade, imageFileReducer, ImageFileState} from '@state/imageFile';
import {PdfFileEffects, PdfFileFacade, pdfFileReducer, PdfFileState} from '@state/pdfFile';
import {EmailEffects, EmailFacade, emailReducer, EmailState} from '@state/email';
import {ShareStatsEffects, ShareStatsFacade} from '@state/shareStats';

export const reducers = {
  users: usersReducer,
  offer: offerReducer,
  auth: authReducer,
  common: commonReducer,
  imageFile: imageFileReducer,
  pdfFile: pdfFileReducer,
  email: emailReducer,
}

export const effects = [
  UsersEffects,
  OfferEffects,
  RouterEffects,
  AuthEffects,
  CommonEffects,
  ImageFileEffects,
  PdfFileEffects,
  EmailEffects,
  ShareStatsEffects
]

export const facades = [
  UsersFacade,
  OfferFacade,
  AuthFacade,
  RouterFacade,
  CommonFacade,
  ImageFileFacade,
  PdfFileFacade,
  EmailFacade,
  ShareStatsFacade
]

export interface AppState {
  users: UsersState,
  offer: OfferState,
  auth: AuthState,
  router: RouterStateUrl,
  common: CommonState,
  imageFile: ImageFileState,
  pdfFile: PdfFileState,
  email: EmailState,
}
