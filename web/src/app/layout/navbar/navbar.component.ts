import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { map, ReplaySubject, takeUntil } from 'rxjs';
import { AllDeviceInfo } from '@interfaces';
import { DeviceInfoService } from '@shared/device-info/device-info.service';
import { CommonFacade } from '@state/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public deviceInfo: AllDeviceInfo;
  public activeMenu: 'destinations' | 'companies' | null = null;
  public destinationMenuItems$ = this.commonFacade.destinations$.pipe(
    map((destinations) =>
      (destinations ?? [])
        .filter((destination) => destination.isActive && destination.showInMenu && Boolean(destination.slug))
        .sort((first, second) => first.name.localeCompare(second.name, 'pl')),
    ),
  );
  public companyMenuItems$ = this.commonFacade.companies$.pipe(
    map((companies) =>
      (companies ?? [])
        .filter((company) => company.isActive && company.showInMenu && Boolean(company.slug))
        .sort((first, second) => first.name.localeCompare(second.name, 'pl')),
    ),
  );

  constructor(
    private readonly deviceInfoService: DeviceInfoService,
    private readonly commonFacade: CommonFacade,
  ) {}

  ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();
    this.commonFacade.getDestinations();
    this.commonFacade.getCompanies();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe((info) => {
      this.deviceInfo = info;
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public toggleMenu(menu: 'destinations' | 'companies'): void {
    if (this.activeMenu === menu) {
      this.activeMenu = null;
      return;
    }

    this.activeMenu = menu;
  }

  public closeMenu(): void {
    this.activeMenu = null;
  }

  @HostListener('document:keydown.escape')
  public closeMenuWithEscape(): void {
    this.closeMenu();
  }
}
