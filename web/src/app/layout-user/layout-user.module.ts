import { NgModule } from '@angular/core';
import { LayoutUserRoutingModule } from './layout-user-routing.module';
import { OfferListComponent } from './offer-list/offer-list.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { SharedModule } from '@shared/shared.module';
import { OfferCardComponent } from './offer-card/offer-card.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { OfferFiltersComponent } from './offer-filters/offer-filters.component';
import { RulesComponent } from './rules/rules.component';
import { ShareStatsComponent } from './share-stats/share-stats.component';

const components = [
  OfferListComponent,
  OfferDetailsComponent,
  OfferCardComponent,
  LoginComponent,
  ContactComponent,
  AboutUsComponent,
  OfferFiltersComponent,
  RulesComponent,
  ShareStatsComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, LayoutUserRoutingModule],
})
export class LayoutUserModule {}
