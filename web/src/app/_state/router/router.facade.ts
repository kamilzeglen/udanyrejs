import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Location } from '@angular/common';
import { ChangeRoutePayload } from '@interfaces';
import { AppState } from '@state';
import * as actions from './router.actions';

@Injectable()
export class RouterFacade {
  constructor(
    private store: Store<AppState>,
    private readonly location: Location
  ) {}

  public changeRoute(params: ChangeRoutePayload): void {
    this.store.dispatch(actions.changeRoute(params));
  }
  public goBack(): void {
    this.location.back();
  }
}
