import {createAction, props} from '@ngrx/store';
import {OfferScrapper} from '@interfaces';

export const scrapOfferFile = createAction('[Scrapper] Scrap Offer' ,props<{ payload: { url: string } }>());
export const scrapOfferFileSuccess = createAction('[Scrapper] Scrap Offer Success', props<{ offer: Partial<OfferScrapper> }>());
export const scrapOfferFileError = createAction('[Scrapper] Scrap Offer Error', props<{ errorMessage: string }>());
