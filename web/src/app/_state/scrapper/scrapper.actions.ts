import {createAction, props} from '@ngrx/store';
import {OfferScrapped} from '@interfaces';

export const scrapOfferFile = createAction('[Scrapper] Scrap Offer' ,props<{ payload: { url: string } }>());
export const scrapOfferFileSuccess = createAction('[Scrapper] Scrap Offer Success', props<{ offer: Partial<OfferScrapped> }>());
export const scrapOfferFileError = createAction('[Scrapper] Scrap Offer Error', props<{ errorMessage: string }>());
