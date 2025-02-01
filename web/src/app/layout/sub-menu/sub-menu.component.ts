import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubMenuItem} from '@interfaces';
import {SubMenuService} from './sub-menu.service';
import {Subscription, take} from 'rxjs';
import {CommonFacade} from '@state/common';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.scss'
})

export class SubMenuComponent implements OnInit, OnDestroy {
  subMenuItems: SubMenuItem[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private readonly subMenuService: SubMenuService,
    private readonly commonFacade: CommonFacade,
  ) {
  }

  public ngOnInit() {
    this.subscription = this.subMenuService.subMenuItems$.subscribe((items) => {

      if (items && items.length > 0) {
        this.subMenuItems = structuredClone(items);
      } else {
        const categories$ = this.commonFacade.getCategories$()
        categories$.pipe(take(1)).subscribe((categories) => {
          this.subMenuItems = categories.map(category => ({
            name: category.name,
            isActive: category.isActive,
            url: `/offers/${category.url}`
          }));
        });
      }
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
