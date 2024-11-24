import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from '../_shared/http/http.service';
import {Offer} from '../_interfaces/offer';
import * as moment from 'moment';
import {ReplaySubject, take} from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public offers: Offer[] | undefined;

  constructor(
    private readonly offersService: HttpService
  )
  {}

  ngOnInit() {
    this.offersService.getAllOffers().pipe(take(1)).subscribe((data: Offer[]) => {
      this.offers = data;
    })
  }

  protected readonly Number = Number;
  protected readonly moment = moment;

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
