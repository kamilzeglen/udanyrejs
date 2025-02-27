import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ShareStatsFacade} from '@state/shareStats';

@Component({
  selector: 'app-share-stats',
  templateUrl: './share-stats.component.html',
  styleUrls: ['./share-stats.component.scss'],
})
export class ShareStatsComponent implements OnInit {
  platform: string;
  offerId: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly shareStatsFacade: ShareStatsFacade
  ) {
  }

  ngOnInit(): void {
    // Pobranie parametrów z URL
    this.platform = this.route.snapshot.paramMap.get('platform')!;
    this.offerId = this.route.snapshot.paramMap.get('offerId')!;

    this.shareStatsFacade.updateShareStats({platform: this.platform, offerId: this.offerId});

    this.redirectToOfferPage();
  }

  // Przekierowanie na stronę oferty
  redirectToOfferPage(): void {
    const offerUrl = `/offers/details/${this.offerId}`;
    window.location.replace(offerUrl);
  }

}
