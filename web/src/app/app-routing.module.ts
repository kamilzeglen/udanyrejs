import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OffersComponent} from './offers/offers.component';
import {OfferDetailsComponent} from './offer-details/offer-details.component';
import {LoginComponent} from './login/login.component';
import {AdminPanelComponent} from './admin-panel/admin-panel.component';
import {AdminPanelAddComponent} from './admin-panel-add/admin-panel-add.component';
import {AdminPanelEditComponent} from './admin-panel-edit/admin-panel-edit.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', component: OffersComponent},
  {path: 'offer-details/:id', component: OfferDetailsComponent},
  {path: 'admin/offers', component: AdminPanelComponent},
  {path: 'admin/offers/add', component: AdminPanelAddComponent},
  {path: 'admin/offers/edit/:id', component: AdminPanelEditComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
