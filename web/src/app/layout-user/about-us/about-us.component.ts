import {Component} from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  officeAddress = {
    street: 'Słowackiego 90',
    city: '32-400 Myślenice'
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
