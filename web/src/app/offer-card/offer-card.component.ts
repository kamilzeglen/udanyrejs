import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss'
})
export class OfferCardComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() company: string = '';
  @Input() price: string = '';
  @Input() shipName: string = '';
  @Input() nights: string = '';
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() imageFileName: string = '';
  @Input() image: string = '';
  @Input() pdfFileName: string = '';
  @Input() itinerary: string = '';
}
