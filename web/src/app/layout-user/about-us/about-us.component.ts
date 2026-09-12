import { Component } from '@angular/core';
import { SeoService } from '@core/seo/seo.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
})
export class AboutUsComponent {
  constructor(private readonly seoService: SeoService) {
    this.seoService.setPageMeta({
      title: 'UdanyRejs - O nas',
      description:
        'Poznaj naszą firmę i naszą misję. UdanyRejs to lider w organizacji luksusowych rejsów wycieczkowych.',
      path: '/about-us',
    });
  }

  officeAddress = {
    street: 'XYZ 123',
    city: '12-345 XYZ',
  };

  cruises_photos = [
    {
      path: 'assets/cruises_photos/1.jpg',
      alt: 'Zdjęcie z Rejsu #1',
    },
    {
      path: 'assets/cruises_photos/2.jpg',
      alt: 'Zdjęcie z Rejsu #2',
    },
    {
      path: 'assets/cruises_photos/3.jpg',
      alt: 'Zdjęcie z Rejsu #3',
    },
    {
      path: 'assets/cruises_photos/4.jpg',
      alt: 'Zdjęcie z Rejsu #4',
    },
  ];
}
