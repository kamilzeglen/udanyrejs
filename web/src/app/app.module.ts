import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { OffersComponent } from './offers/offers.component';
import { OfferDetailsComponent } from './offer-details/offer-details.component';
import { OfferCardComponent } from './offer-card/offer-card.component';
import { LoginComponent } from './login/login.component';
import {ReactiveFormsModule} from '@angular/forms';
import {provideHttpClient} from '@angular/common/http';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AdminPanelAddComponent } from './admin-panel-add/admin-panel-add.component';
import { AdminPanelEditComponent } from './admin-panel-edit/admin-panel-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    OffersComponent,
    OfferDetailsComponent,
    OfferCardComponent,
    LoginComponent,
    AdminPanelComponent,
    AdminPanelAddComponent,
    AdminPanelEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
