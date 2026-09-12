import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShareStatsFacade } from '@state/shareStats';
import { SeoService } from '@core/seo/seo.service';

@Component({
  selector: 'app-share-stats',
  templateUrl: './share-stats.component.html',
  styleUrls: ['./share-stats.component.scss'],
})
export class ShareStatsComponent implements OnInit {
  platform: string;
  offerId: string;
  termId: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly shareStatsFacade: ShareStatsFacade,
    private readonly seoService: SeoService,
  ) {
    this.seoService.setPageMeta({
      title: 'UdanyRejs',
      description: 'Przekierowanie do oferty rejsu.',
      path: this.router.url,
      noIndex: true,
    });
  }

  ngOnInit(): void {
    this.platform = this.route.snapshot.paramMap.get('platform')!;
    this.offerId = this.route.snapshot.paramMap.get('offerId')!;
    this.termId = this.route.snapshot.paramMap.get('termId')!;

    this.shareStatsFacade.updateShareStats({ platform: this.platform, offerId: this.offerId, termId: this.termId });

    this.redirectToOfferPage();
  }

  redirectToOfferPage(): void {
    const offerUrl = `/offers/details/${this.offerId}?termId=${this.termId}`;
    window.location.replace(offerUrl);
  }
}
