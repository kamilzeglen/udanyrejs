import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from './admin.component';
import {AuthGuard} from '../guard/auth-guard.service';
import {AdminOfferListComponent} from './admin-offer-list/admin-offer-list.component';
import {NgModule} from '@angular/core';
import {AdminOfferAddEditComponent} from './admin-offer-add-edit/admin-offer-add-edit.component';


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'offers', pathMatch: 'prefix'},
      {
        path: 'offers',
        component: AdminOfferListComponent,
      },
      {
        path: 'offers/add',
        component: AdminOfferAddEditComponent,
      },
      {
        path: 'offers/edit/:offerId',
        component: AdminOfferAddEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
