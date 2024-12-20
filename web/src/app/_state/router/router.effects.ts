import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofType, createEffect } from '@ngrx/effects';

import { tap } from 'rxjs/operators';

import * as fromRouter from './router.actions';
import { ChangeRoutePayload } from '@interfaces';

@Injectable()
export class RouterEffects {
  public routesHistory: ChangeRoutePayload[] = [];

  constructor(
    private actions$: Actions,
    private router: Router
  ) {}

  changeRoute$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fromRouter.changeRoute),
        tap((route: ChangeRoutePayload) => {
          const { extras, linkParams } = route;
          return this.router.navigate(linkParams, { ...extras });
        })
      ),
    { dispatch: false }
  );
}
