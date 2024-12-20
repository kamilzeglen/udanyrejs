import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import {SharedModule} from '@shared/shared.module';
import {AdminRoutingModule} from './admin-routing.module';
import {AdminOfferListComponent} from './admin-offer-list/admin-offer-list.component';
import {AdminOfferAddComponent} from './admin-offer-add/admin-offer-add.component';

const components = [
  AdminComponent,
  AdminOfferListComponent,
  AdminOfferAddComponent
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule { }
