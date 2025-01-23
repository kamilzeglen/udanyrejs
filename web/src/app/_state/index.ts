import {CommonEffects, CommonFacade, commonReducer, CommonState} from '@state/common';
import {UsersEffects, UsersFacade, usersReducer, UsersState} from '@state/users';
import {AuthEffects, AuthFacade, authReducer, AuthState} from '@state/auth';
import {RouterEffects, RouterFacade, RouterStateUrl} from '@state/router';
import {OfferEffects, OfferFacade, offerReducer, OfferState} from 'src/app/_state/offer';
import {ImageFileEffects, ImageFileFacade, imageFileReducer, ImageFileState} from '@state/imageFile';
import {PdfFileEffects, PdfFileFacade, pdfFileReducer, PdfFileState} from '@state/pdfFile';
import {ScrapperEffects, ScrapperFacade, scrapperReducer, ScrapperState} from '@state/scrapper';

export const reducers = {
  users: usersReducer,
  offer: offerReducer,
  auth: authReducer,
  common: commonReducer,
  imageFile: imageFileReducer,
  pdfFile: pdfFileReducer,
  scrapper: scrapperReducer,
}

export const effects = [
  UsersEffects,
  OfferEffects,
  RouterEffects,
  AuthEffects,
  CommonEffects,
  ImageFileEffects,
  PdfFileEffects,
  ScrapperEffects,
]

export const facades = [
  UsersFacade,
  OfferFacade,
  AuthFacade,
  RouterFacade,
  CommonFacade,
  ImageFileFacade,
  PdfFileFacade,
  ScrapperFacade
]

export interface AppState {
  users: UsersState,
  offer: OfferState,
  auth: AuthState,
  router: RouterStateUrl,
  common: CommonState,
  imageFile: ImageFileState,
  pdfFile: PdfFileState,
  scrapper: ScrapperState,
}
