import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import {SharedModule} from '@shared/shared.module';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminOfferListComponent} from './admin-offer-list/admin-offer-list.component';
import {AdminOfferAddEditComponent} from './admin-offer-add-edit/admin-offer-add-edit.component';

const components = [
  AdminComponent,
  AdminOfferListComponent,
  AdminOfferAddEditComponent
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule { }
