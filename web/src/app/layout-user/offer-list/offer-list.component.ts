import {Component, OnDestroy, OnInit} from '@angular/core';
import {OfferFacade} from 'src/app/_state/offer';
import {ReplaySubject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SearchOffersPayload, SubMenuItem} from '@interfaces';
import {CommonFacade} from '@state/common';
import moment from 'moment-timezone';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss'
})
export class OfferListComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public filters: { [key: string]: any } = {
    category: null,
    startDate: null,
    endDate: null,
    companyIdList: [],
    destinationIdList: []
  };

  public offers$ = this.offerFacade.offers$
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
      this.filters.category = paramMap.get('category');

      this.commonFacade.getCategories()
      this.getOffers(this.filters)
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

  public getOffers(opts?: Partial<SearchOffersPayload>): void {
    if (opts?.startDate) {
      opts.startDate = moment.tz(opts.startDate, 'Europe/Warsaw').startOf('day').toDate();
    }

    if (opts?.endDate) {
      opts.endDate = moment.tz(opts.endDate, 'Europe/Warsaw').endOf('day').toDate();
    }

    this.offerFacade.getOffers(opts);
  }

  public onFiltersChanged(changedFilter: { key: string; value: any }): void {
    this.filters = {...this.filters, [changedFilter.key]: changedFilter.value};

    this.getOffers(this.filters);
  }
}
