import { createAction, props } from '@ngrx/store';

import { ChangeRoutePayload } from '@interfaces';

export const changeRoute = createAction('[Router] Change Route', props<ChangeRoutePayload>());
