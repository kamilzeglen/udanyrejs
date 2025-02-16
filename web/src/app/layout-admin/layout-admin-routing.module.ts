import {RouterModule, Routes} from '@angular/router';
import {LayoutAdminComponent} from './layout-admin.component';
import {AuthGuard} from '@core/_guard/auth-guard.service';
import {AdminOfferListComponent} from './admin-offer-list/admin-offer-list.component';
import {NgModule} from '@angular/core';
import {AdminOfferAddEditComponent} from './admin-offer-add-edit/admin-offer-add-edit.component';
import {AdminCompanyListComponent} from './admin-company-list/admin-company-list.component';
import {AdminShipAddEditComponent} from './admin-ship-add-edit/admin-ship-add-edit.component';
import {AdminShipListComponent} from './admin-ship-list/admin-ship-list.component';
import {AdminCategoryListComponent} from './admin-category-list/admin-category-list.component';
import {AdminDestinationListComponent} from './admin-destination-list/admin-destination-list.component';
import {AdminDestinationAddEditComponent} from './admin-destination-add-edit/admin-destination-add-edit.component';
import {AdminCompanyAddEditComponent} from './admin-company-add-edit/admin-company-add-edit.component';
import {AdminCategoryAddEditComponent} from './admin-category-add-edit/admin-category-add-edit.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutAdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: LayoutAdminComponent,
      },
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
      {
        path: 'companies',
        component: AdminCompanyListComponent,
      },
      {
        path: 'companies/add',
        component: AdminCompanyAddEditComponent,
      },
      {
        path: 'companies/edit/:companyId',
        component: AdminCompanyAddEditComponent,
      },
      {
        path: 'ships',
        component: AdminShipListComponent,
      },
      {
        path: 'ships/add',
        component: AdminShipAddEditComponent,
      },
      {
        path: 'ships/edit/:shipId',
        component: AdminShipAddEditComponent,
      },
      {
        path: 'ships/:companyId',
        component: AdminShipListComponent,
      },
      {
        path: 'categories',
        component: AdminCategoryListComponent,
      },
      {
        path: 'categories/add',
        component: AdminCategoryAddEditComponent,
      },
      {
        path: 'categories/edit/:categoryId',
        component: AdminCategoryAddEditComponent,
      },
      {
        path: 'destinations',
        component: AdminDestinationListComponent,
      },
      {
        path: 'destinations/add',
        component: AdminDestinationAddEditComponent,
      },
      {
        path: 'destinations/edit/:destinationId',
        component: AdminDestinationAddEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutAdminRoutingModule {}
