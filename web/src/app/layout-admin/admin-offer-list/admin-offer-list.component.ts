import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferFacade} from '@state/offer';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {AllDeviceInfo, Offer, SearchOffersPayload} from '@interfaces';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';
import {DeviceInfoService} from '@shared/device-info/device-info.service';
import {Sort, SortDirection} from '@angular/material/sort';
import {Pagination} from '../../_interfaces/http';
import {ScrapperFacade} from '@state/scrapper';

@Component({
  selector: 'app-admin-offer-list',
  templateUrl: './admin-offer-list.component.html',
  styleUrl: './admin-offer-list.component.scss'
})
export class AdminOfferListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public pageSize = 100;

  public defaultSortBy = 'createdAt';
  public defaultSortDir: SortDirection = 'desc';

  public currentSortBy = 'createdAt';
  public currentSortDir: SortDirection = 'desc';

  public deviceInfo: AllDeviceInfo;

  public offers$ = this.offerFacade.offers$
  public loading$ = this.offerFacade.loading$
  public scrapping$ = this.scrapperFacade.loading$
  public pagination$ = this.offerFacade.pagination$

  public columnsToDisplay: string[];
  public allColumns: string[] = [
    'id',
    'name',
    'price',
    'company.name',
    'ship.name',
    'startDate',
    'endDate',
    'actions',
    'stats',
    'photos',
    'updatedAt',
    'createdAt',
  ];

  constructor(
    private readonly offerFacade: OfferFacade,
    private readonly scrapperFacade: ScrapperFacade,
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
      this.getOffers()
    })

    this.scrapperFacade.syncOfferPriceSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie zaktualizowano oferte")
      this.getOffers()
    })

    this.getOffers()
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public sortData(sort: Sort): void {
    this.pagination$.pipe(take(1)).subscribe(pagination => {
      const {all, count, ...rest} = pagination;
      this.currentSortBy = sort.active as Pagination['orderBy'];
      this.currentSortDir = sort.direction as Pagination['orderDir'];
      this.getOffers({
        ...rest,
        offset: 0,
        limit: this.pageSize,
        orderBy: this.currentSortBy,
        orderDir: this.currentSortDir,

      });
    });
  }

  public getOffers(opts?: Partial<SearchOffersPayload>): void {
    this.pagination$.pipe(take(1)).subscribe(pagination => {

      if (opts && 'orderBy' in opts) {
        this.currentSortBy = opts.orderBy;
      }

      if (opts && 'orderDir' in opts) {
        this.currentSortDir = opts.orderDir;
      }

      if (opts && 'limit' in opts) {
        this.pageSize = opts.limit;
      }

      this.offerFacade.getOffers({
        ...pagination,
        limit: this.pageSize,
        orderBy: this.currentSortBy || this.defaultSortBy,
        orderDir: this.currentSortDir || this.defaultSortDir,
        showInactive: true
      });
    });
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

  public syncOfferPrice(offer: Offer): void {

    if (!offer.offerUrl) {
      this.snackService.showError('Oferta nie posiada odniesienia URL');
      return
    }

    this.scrapperFacade.syncOfferPrice({id: offer.id})
  }

  public addOffer(): void {
    const linkParams = ["/admin/offers/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

  public editShip(shipId: string): void {
    const linkParams = ["/admin/ships/edit/" + shipId]
    this.routerFacade.changeRoute({linkParams})
  }

  public editCompany(companyId: string): void {
    const linkParams = ["/admin/companies/edit/" + companyId]
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

  public copyToClipboard(type: string, id: string) {
    const url = `${window.location.origin}/share/${type}/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      console.log('Skopiowano:', url);
    }).catch(err => {
      console.error('Błąd kopiowania:', err);
    });
  }

}
