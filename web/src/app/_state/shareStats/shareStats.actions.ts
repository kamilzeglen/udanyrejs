import {createAction, props} from '@ngrx/store';

export const updateShareStats = createAction('[Share-Stats] Update Share Stat', props<{ payload: {platform: string, offerId: string} }>());
export const updateShareStatsSuccess = createAction('[Share-Stats] Update Share Stat Success');
export const updateShareStatsError = createAction('[Share-Stats] Update Share Stat Error');
