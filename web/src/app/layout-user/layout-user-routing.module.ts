import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferListComponent } from './offer-list/offer-list.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { RulesComponent } from './rules/rules.component';
import { ShareStatsComponent } from './share-stats/share-stats.component';
import { SeoLandingPageComponent } from './seo-landing-page/seo-landing-page.component';
import { SeoDirectoryComponent } from './seo-directory/seo-directory.component';

const routes: Routes = [
  { path: '', component: OfferListComponent },
  { path: 'offers', component: OfferListComponent },
  { path: 'offers/:category', component: OfferListComponent },
  { path: 'offers/details/:offerId', component: OfferDetailsComponent },
  { path: 'destinations', component: SeoDirectoryComponent, data: { entityType: 'destination' } },
  { path: 'destinations/:slug', component: SeoLandingPageComponent, data: { entityType: 'destination' } },
  { path: 'cruise-lines', component: SeoDirectoryComponent, data: { entityType: 'company' } },
  { path: 'cruise-lines/:slug', component: SeoLandingPageComponent, data: { entityType: 'company' } },
  { path: 'login', component: LoginComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'contact/:offerId', component: ContactComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'share/:platform/:offerId/:termId', component: ShareStatsComponent },
  { path: 'rules', component: RulesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutUserRoutingModule {}
