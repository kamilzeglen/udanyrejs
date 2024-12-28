import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {OfferListComponent} from './offer/offer-list/offer-list.component';
import {OfferDetailsComponent} from './offer/offer-details/offer-details.component';
import {ContactComponent} from './contact/contact.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: OfferListComponent},
      {path: 'login', component: LoginComponent},
      {path: 'contact', component: ContactComponent},
      {path: 'offer-details/:offerId', component: OfferDetailsComponent},
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
      },
      {path: '**', redirectTo: ''},
    ],
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
