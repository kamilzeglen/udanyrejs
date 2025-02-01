import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OfferListComponent} from './offer-list/offer-list.component';
import {OfferDetailsComponent} from './offer-details/offer-details.component';
import {LoginComponent} from './login/login.component';
import {ContactComponent} from './contact/contact.component';
import {AboutUsComponent} from './about-us/about-us.component';

const routes: Routes = [
  {path: '', component: OfferListComponent},
  {path: 'offers', component: OfferListComponent},
  {path: 'offers/:category', component: OfferListComponent},
  {path: 'offers/details/:offerId', component: OfferDetailsComponent},
  {path: 'login', component: LoginComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'contact/:offerId', component: ContactComponent},
  {path: 'about-us', component: AboutUsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutUserRoutingModule {
}
