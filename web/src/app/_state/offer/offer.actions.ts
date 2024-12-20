import {createAction, props} from '@ngrx/store';
import {Offer} from '@interfaces';

export const getOffers = createAction('[Offer] Get Offers');
export const getOffersSuccess = createAction('[Offer] Get Offers Success', props<{ offers: Offer[] }>());
export const getOffersError = createAction('[Offers] Get Offers Error', props<{ errorMessage: string }>());

export const getOffer = createAction('[Offer] Get Offer', props<{ payload: { id: string } }>());
export const getOfferSuccess = createAction('[Offer] Get Offer Success', props<{ offer: Offer }>());
export const getOfferError = createAction('[Offer] Get Offer Error', props<{ errorMessage: string }>());

export const createOffer = createAction('[Offer] Create Offer', props<{ payload: Partial<Offer> }>());
export const createOfferSuccess = createAction('[Offer] Create Offer Success');
export const createOfferError = createAction('[Offer] Create Offer Error', props<{ errorMessage: string }>());

export const deleteOffer = createAction('[Offer] Delete Offer');
export const deleteOfferSuccess = createAction('[Offer] Delete Offer Success');
export const deleteOfferError = createAction('[Offer] Delete Offer Error', props<{ errorMessage: string }>());
