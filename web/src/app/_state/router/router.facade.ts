import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Location } from '@angular/common';
import { ChangeRoutePayload } from '@interfaces';
import { AppState } from '@state';
import * as actions from './router.actions';
import { BehaviorSubject, filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Injectable()
export class RouterFacade {
  private previousUrlSubject = new BehaviorSubject<string | null>(null);
  private currentUrl: string | null = null;

  constructor(
    private readonly store: Store<AppState>,
    private readonly location: Location,
    private readonly router: Router,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.previousUrlSubject.next(this.currentUrl);
      this.currentUrl = event.url;
    });
  }

  public changeRoute(params: ChangeRoutePayload): void {
    this.store.dispatch(actions.changeRoute(params));
  }

  public goBack(): void {
    this.location.back();
  }

  public getPreviousUrl() {
    return this.previousUrlSubject.asObservable();
  }
}
