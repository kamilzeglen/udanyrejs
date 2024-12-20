import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '@shared/login/login.component';
import {OfferListComponent} from './offer/offer-list/offer-list.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: OfferListComponent},
      {path: 'login', component: LoginComponent},
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
