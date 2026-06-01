import {Component} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

  constructor(private titleService: Title, private metaService: Meta) {
    this.titleService.setTitle('UdanyRejs - O nas');
    this.metaService.updateTag({
      name: 'description',
      content: 'Poznaj naszą firmę i naszą misję. UdanyRejs to lider w organizacji luksusowych rejsów wycieczkowych.'
    });
  }

  officeAddress = {
    street: 'XYZ 123',
    city: '12-345 XYZ'
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
