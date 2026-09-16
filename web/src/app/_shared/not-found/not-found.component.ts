import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '@core/seo/seo.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly seoService: SeoService,
  ) {}

  public ngOnInit(): void {
    this.seoService.setPageMeta({
      title: 'Nie znaleziono strony | UdanyRejs',
      description: 'Ta strona nie jest już dostępna.',
      path: this.router.url,
      noIndex: true,
    });
  }
}
