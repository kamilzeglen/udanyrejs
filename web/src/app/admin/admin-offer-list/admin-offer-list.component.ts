import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferFacade} from '@state/offer';
import {ConfirmationModalService} from '@shared/confirmation-modal/confirmation-modal.service';
import {ReplaySubject, take, takeUntil} from 'rxjs';
import {Offer} from '@interfaces';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';
import {RouterFacade} from '@state/router';

@Component({
  selector: 'app-admin-offer-list',
  templateUrl: './admin-offer-list.component.html',
  styleUrl: './admin-offer-list.component.scss'
})
export class AdminOfferListComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public offers$ = this.offerFacade.offers$
  public loading$ = this.offerFacade.loading$

  public displayedColumns: string[] = [
    'id',
    'name',
    'price',
    'company',
    'ship',
    'startDate',
    'endDate',
    'actions',
    'createdAt',
  ];

  constructor(
    private readonly offerFacade: OfferFacade,
    private readonly confirmationModalService: ConfirmationModalService,
    private readonly snackService: SnackbarService,
    private readonly routerFacade: RouterFacade,
  ) {
  }

  ngOnInit() {
    this.offerFacade.getOffers()

    this.offerFacade.deleteOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie usunięto oferte")
      this.offerFacade.getOffers()
    })
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public delete(offer: Offer): void {
    console.log(offer.id)

    this.confirmationModalService
      .open({
        message: "Jesteś pewny że chesz usunąc oferte: " + offer.name + "?"
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

  public edit(offer: Offer): void {
    const linkParams = ["/admin/offers/edit/" + offer.id]
    this.routerFacade.changeRoute({linkParams})
  }

  public addOffer(): void {
    const linkParams = ["/admin/offers/add/"]
    this.routerFacade.changeRoute({linkParams})
  }

}
