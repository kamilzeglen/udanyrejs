import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-offer-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-skeleton.component.html',
  styleUrl: './offer-skeleton.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class OfferSkeletonComponent {
  @Input() public variant: 'card' | 'details' = 'card';
}
