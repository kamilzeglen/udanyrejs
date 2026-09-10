import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, ReplaySubject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

export interface SubMenuItem {
  name: string;
  isVisible: boolean;
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
      { name: 'Oferty', isVisible: true, url: '/admin/offers' },
      { name: 'Aramtorzy', isVisible: true, url: '/admin/companies' },
      { name: 'Statki', isVisible: true, url: '/admin/ships' },
      { name: 'Kategorie', isVisible: true, url: '/admin/categories' },
      { name: 'Regiony', isVisible: true, url: '/admin/destinations' },
      { name: 'Kabiny', isVisible: true, url: '/admin/cabin-types' },
      { name: 'Logi', isVisible: true, url: '/admin/logs' },
    ],
  };

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
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
