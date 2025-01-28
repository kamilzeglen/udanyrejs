import {initialState, ScrapperState} from './scrapper.state';
import {Action, createReducer, on} from '@ngrx/store';
import * as scrapperActions from '@state/scrapper/scrapper.actions';


const reducer = createReducer(
  initialState,

  on(scrapperActions.scrapOfferFile, state => ({
    ...state,
    loading: true,
    errorMessage: null,
    scrappedData: null,
  })),
  on(scrapperActions.scrapOfferFileSuccess, (state, {offer}) => ({
    ...state,
    loading: false,
    errorMessage: null,
    scrappedData: offer
  })),
  on(scrapperActions.scrapOfferFileError, (state, {errorMessage}) => ({
    ...state,
    loading: false,
    errorMessage,
    scrappedData: null,
  })),
)

export function scrapperReducer(state: ScrapperState | undefined, action: Action): ScrapperState {
  return reducer(state, action);
}
