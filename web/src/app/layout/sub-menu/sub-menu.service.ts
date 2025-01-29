import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, ReplaySubject, takeUntil} from 'rxjs';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';

export interface SubMenuItem {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubMenuService implements OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  private subMenuItemsSubject = new BehaviorSubject<SubMenuItem[]>([]);
  subMenuItems$ = this.subMenuItemsSubject.asObservable();

  private menuConfig: { [key: string]: SubMenuItem[] } = {
    '/admin': [
      {name: 'Oferty', url: '/admin/offers'},
      {name: 'Aramtorzy', url: '/admin/companies'},
      {name: 'Statki', url: '/admin/ships'},
    ],
  };

  constructor(
    private readonly router: Router,
  ) {

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateSubMenu(event.urlAfterRedirects);
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  updateSubMenu(url: string) {
    const basePath = `/${url.split('/')[1]}`;
    this.subMenuItemsSubject.next(this.menuConfig[basePath] || []);
  }

}
