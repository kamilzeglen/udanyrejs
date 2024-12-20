import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from './admin.component';
import {AuthGuard} from '../guard/auth-guard.service';
import {AdminOfferListComponent} from './admin-offer-list/admin-offer-list.component';
import {NgModule} from '@angular/core';
import {AdminOfferAddComponent} from './admin-offer-add/admin-offer-add.component';


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
        component: AdminOfferAddComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
