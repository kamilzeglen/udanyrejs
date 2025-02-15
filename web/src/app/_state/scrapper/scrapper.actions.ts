import {createAction, props} from '@ngrx/store';
import {OfferScrapper} from '@interfaces';

export const scrapOfferFile = createAction('[Scrapper] Scrap Offer' ,props<{ payload: { url: string } }>());
export const scrapOfferFileSuccess = createAction('[Scrapper] Scrap Offer Success', props<{ offer: Partial<OfferScrapper> }>());
export const scrapOfferFileError = createAction('[Scrapper] Scrap Offer Error', props<{ errorMessage: string }>());

export const syncOfferPrice = createAction('[Offer] Sync Offer Price', props<{ payload: { id: string }}>());
export const syncOfferPriceSuccess = createAction('[Offer] Sync Offer Price Success');
export const syncOfferPriceError = createAction('[Offer] Sync Offer Price Error', props<{ errorMessage: string }>());
