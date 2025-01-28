import { NgModule } from '@angular/core';
import { LayoutAdminComponent } from './layout-admin.component';
import {SharedModule} from '@shared/shared.module';
import {LayoutAdminRoutingModule} from './layout-admin-routing.module';
import {AdminOfferListComponent} from './admin-offer-list/admin-offer-list.component';
import {AdminOfferAddEditComponent} from './admin-offer-add-edit/admin-offer-add-edit.component';
import {AdminCompanyListComponent} from './admin-company-list/admin-company-list.component';
import {AdminCompanyAddEditComponent} from './admin-company-add-edit/admin-company-add-edit.component';
import {AdminShipListComponent} from './admin-ship-list/admin-ship-list.component';
import {AdminShipAddEditComponent} from './admin-ship-add-edit/admin-ship-add-edit.component';

const components = [
  LayoutAdminComponent,
  AdminOfferListComponent,
  AdminOfferAddEditComponent,
  AdminCompanyListComponent,
  AdminCompanyAddEditComponent,
  AdminShipListComponent,
  AdminShipAddEditComponent
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, LayoutAdminRoutingModule],
})
export class LayoutAdminModule { }
