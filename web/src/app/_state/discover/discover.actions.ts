import { createAction, props } from '@ngrx/store';
import { ScrapedOfferDraft } from '@interfaces';

export const startDiscovery = createAction(
  '[Discover] Start Discovery',
  props<{ payload: { count: number; companyIds: string[] } }>(),
);
export const startDiscoverySuccess = createAction('[Discover] Start Discovery Success');
export const startDiscoveryError = createAction('[Discover] Start Discovery Error', props<{ errorMessage: string }>());

export const getDrafts = createAction('[Discover] Get Drafts');
export const getDraftsSuccess = createAction('[Discover] Get Drafts Success', props<{ drafts: ScrapedOfferDraft[] }>());
export const getDraftsError = createAction('[Discover] Get Drafts Error', props<{ errorMessage: string }>());

export const getDraft = createAction('[Discover] Get Draft', props<{ payload: { id: string } }>());
export const getDraftSuccess = createAction('[Discover] Get Draft Success', props<{ draft: ScrapedOfferDraft }>());
export const getDraftError = createAction('[Discover] Get Draft Error', props<{ errorMessage: string }>());

export const deleteDraft = createAction('[Discover] Delete Draft', props<{ payload: { id: string } }>());
export const deleteDraftSuccess = createAction('[Discover] Delete Draft Success');
export const deleteDraftError = createAction('[Discover] Delete Draft Error', props<{ errorMessage: string }>());
