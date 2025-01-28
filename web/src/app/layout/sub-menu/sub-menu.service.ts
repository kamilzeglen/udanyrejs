import {Injectable, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {BehaviorSubject, ReplaySubject, takeUntil} from 'rxjs';
import {CommonFacade} from '@state/common';
import {Category} from '@interfaces';

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

  private routesConfig: { [key: string]: SubMenuItem[] } = {
    // '/contact': [
    //   {name: 'Contact Link 1', url: '/contact/link1'},
    //   {name: 'Contact Link 2', url: '/contact/link2'},
    // ],
  };

  constructor(
    private readonly commonFacade: CommonFacade,
    private readonly router: Router
  ) {

    this.commonFacade.getCategories();
    this.commonFacade.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories: Category[]) => {
        const defaultSubMenu = categories.map((category) => ({
          name: category.name,
          url: `/${category.url}`,
        }));
        this.updateSubMenu(this.router.url, defaultSubMenu);
      });

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

  private updateSubMenu(currentUrl: string, defaultSubMenu?: SubMenuItem[]) {
    const items = this.routesConfig[currentUrl] || defaultSubMenu || [];
    this.subMenuItemsSubject.next(items);
  }
}
