import { NgModule } from '@angular/core';
import { LayoutAdminComponent } from './layout-admin.component';
import { SharedModule } from '@shared/shared.module';
import { LayoutAdminRoutingModule } from './layout-admin-routing.module';
import { AdminOfferListComponent } from './admin-offer-list/admin-offer-list.component';
import { AdminOfferAddEditComponent } from './admin-offer-add-edit/admin-offer-add-edit.component';
import { AdminCompanyListComponent } from './admin-company-list/admin-company-list.component';
import { AdminShipListComponent } from './admin-ship-list/admin-ship-list.component';
import { AdminShipAddEditComponent } from './admin-ship-add-edit/admin-ship-add-edit.component';
import { AdminCategoryListComponent } from './admin-category-list/admin-category-list.component';
import { AdminDestinationListComponent } from './admin-destination-list/admin-destination-list.component';
import { AdminDestinationAddEditComponent } from './admin-destination-add-edit/admin-destination-add-edit.component';
import { AdminCompanyAddEditComponent } from './admin-company-add-edit/admin-company-add-edit.component';
import { AdminCategoryAddEditComponent } from './admin-category-add-edit/admin-category-add-edit.component';
import { AdminLogsListComponent } from './admin-logs-list/admin-logs-list.component';

const components = [
  LayoutAdminComponent,
  AdminOfferListComponent,
  AdminOfferAddEditComponent,
  AdminCompanyListComponent,
  AdminCompanyAddEditComponent,
  AdminCategoryListComponent,
  AdminCategoryAddEditComponent,
  AdminShipListComponent,
  AdminShipAddEditComponent,
  AdminDestinationListComponent,
  AdminDestinationAddEditComponent,
  AdminLogsListComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, LayoutAdminRoutingModule],
})
export class LayoutAdminModule {}
