import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferFacade} from '@state/offer';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {AllDeviceInfo, Offer} from '@interfaces';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';
import {DeviceInfoService} from '@shared/device-info/device-info.service';

@Component({
  selector: 'app-admin-offer-list',
  templateUrl: './admin-offer-list.component.html',
  styleUrl: './admin-offer-list.component.scss'
})
export class AdminOfferListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public deviceInfo: AllDeviceInfo;

  public offers$ = this.offerFacade.offers$
  public loading$ = this.offerFacade.loading$

  public columnsToDisplay: string[];
  public allColumns: string[] = [
    'id',
    'name',
    'price',
    'company',
    'ship',
    'startDate',
    'endDate',
    'actions',
    'updatedAt',
    'createdAt',
  ];

  constructor(
    private readonly offerFacade: OfferFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
    private readonly routerFacade: RouterFacade,
    private readonly deviceInfoService: DeviceInfoService
  ) {
  }

  public ngOnInit() {
    this.deviceInfo = this.deviceInfoService.getInfo();

    this.deviceInfoService.infoEmitter.pipe(takeUntil(this.destroy$)).subscribe(info => {
      this.deviceInfo = info;
    });

    this.columnsToDisplay = this.getColumnsToDisplay();

    this.offerFacade.deleteOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto ofertę")
      this.offerFacade.getOffers()
    })

    this.offerFacade.getOffers()
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public deleteOffer(offer: Offer): void {
    this.confirmationModalService
      .open({
        message: "Jesteś pewny że chcesz usunąć ofertę: " + offer.name + "?"
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        if (!res) {
          return;
        }

        this.offerFacade.deleteOffer({id: offer.id})
      });
  }

  public detailsOffer(offer: Offer): void {
    const linkParams = ["/offers/details/" + offer.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public editOffer(offer: Offer): void {
    const linkParams = ["/admin/offers/edit/" + offer.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public addOffer(): void {
    const linkParams = ["/admin/offers/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

  public getColumnsToDisplay(): string[] {
    if (this.deviceInfo.deviceTypeDetected === 'DESKTOP') {
      return this.allColumns;
    }
    if (this.deviceInfo.deviceTypeDetected === 'TABLET') {
      return ['name', 'price', 'ship', 'startDate', 'endDate'];
    }
    if (this.deviceInfo.deviceTypeDetected === 'PHONE') {
      return ['name', 'startDate', 'endDate'];
    }
    return [];
  }
}
