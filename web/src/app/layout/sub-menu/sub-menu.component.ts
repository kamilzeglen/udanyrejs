import { Component, OnDestroy, OnInit } from '@angular/core';
import { AllDeviceInfo, SubMenuItem } from '@interfaces';
import { SubMenuService } from './sub-menu.service';
import { ReplaySubject, Subscription, take, takeUntil } from 'rxjs';
import { CommonFacade } from '@state/common';
import { DeviceInfoService } from '@shared/device-info/device-info.service';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.scss',
})
export class SubMenuComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  subMenuItems: SubMenuItem[] = [];
  private subscription: Subscription = new Subscription();

  public deviceInfo: AllDeviceInfo;

  constructor(
    private readonly subMenuService: SubMenuService,
    private readonly commonFacade: CommonFacade,
    private readonly deviceInfoService: DeviceInfoService,
  ) {}

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });

    this.subscription = this.subMenuService.subMenuItems$.subscribe((items) => {
      if (items && items.length > 0) {
        this.subMenuItems = structuredClone(items).filter((item) => item.isVisible);
      } else {
        const categories$ = this.commonFacade.getCategories$();
        categories$.pipe(take(1)).subscribe((categories) => {
          this.subMenuItems = categories
            .filter((category) => category.isActive && category.isVisible)
            .map((category) => ({
              name: category.name,
              isVisible: category.isVisible,
              url: `/offers/${category.url}`,
            }));
        });
      }
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
