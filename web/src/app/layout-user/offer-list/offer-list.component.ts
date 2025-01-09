import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferFacade} from 'src/app/_state/offer';
import {ReplaySubject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {OffersPayload, SubMenuItem} from '@interfaces';
import {CommonFacade} from '@state/common';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss'
})
export class OfferListComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public category: string

  public offers$ = this.offerFacade.offers$
  public categories$ = this.commonFacade.categories$
  public loading$ = this.offerFacade.loading$

  public subMenuItems: SubMenuItem[] = [];

  constructor(
    private readonly offerFacade: OfferFacade,
    private readonly commonFacade: CommonFacade,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      this.category = paramMap.get('category');

      const searchOpts: Partial<OffersPayload> = {
        category: this.category?.toLowerCase()
      };

      this.commonFacade.getCategories()
      this.getOffers(searchOpts)
    })

    this.commonFacade.getCategoriesSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(action => {
        const categories = action.categories;
        this.subMenuItems = [
          {name: 'Wszystkie', url: '/offers'},
          ...categories.map(category => ({
            name: category.name,
            url: `/offers/${category.url}`
          }))
        ];
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public getOffers(opts?: Partial<OffersPayload>): void {
    this.offerFacade.getOffers(opts)
  }
}
