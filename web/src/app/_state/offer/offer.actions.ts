import {createAction, props} from '@ngrx/store';
import {Offer} from '@interfaces';
import {OffersPayload} from '@interfaces';

export const getOffers = createAction('[Offer] Get Offers', props<{ payload: Partial<OffersPayload> }>());
export const getOffersSuccess = createAction('[Offer] Get Offers Success', props<{ offers: Offer[] }>());
export const getOffersError = createAction('[Offers] Get Offers Error', props<{ errorMessage: string }>());

export const getOffer = createAction('[Offer] Get Offer', props<{ payload: { id: string } }>());
export const getOfferSuccess = createAction('[Offer] Get Offer Success', props<{ offer: Offer }>());
export const getOfferError = createAction('[Offer] Get Offer Error', props<{ errorMessage: string }>());

export const createOffer = createAction('[Offer] Create Offer', props<{ payload: { formData: FormData } }>());
export const createOfferSuccess = createAction('[Offer] Create Offer Success');
export const createOfferError = createAction('[Offer] Create Offer Error', props<{ errorMessage: string }>());

export const updateOffer = createAction('[Offer] Update Offer', props<{
  payload: { id: string, formData: FormData }
}>());
export const updateOfferSuccess = createAction('[Offer] Update Offer Success');
export const updateOfferError = createAction('[Offer] Update Offer Error', props<{ errorMessage: string }>());

export const deleteOffer = createAction('[Offer] Delete Offer', props<{ payload: { id: string } }>());
export const deleteOfferSuccess = createAction('[Offer] Delete Offer Success');
export const deleteOfferError = createAction('[Offer] Delete Offer Error', props<{ errorMessage: string }>());
