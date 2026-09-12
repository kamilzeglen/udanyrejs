import { Component } from '@angular/core';
import { SeoService } from '@core/seo/seo.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
})
export class RulesComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.setPageMeta({
      title: 'UdanyRejs - Regulamin',
      description: 'Sprawdź regulamin rejsów wycieczkowych UdanyRejs. Wszystkie warunki i zasady w jednym miejscu.',
      path: '/rules',
    });
  }
}
