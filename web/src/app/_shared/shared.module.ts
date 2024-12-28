import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {LayoutComponent} from '../layout/layout.component';
import {LoginComponent} from '../login/login.component';
import {OfferListComponent} from '../offer/offer-list/offer-list.component';
import {OfferCardComponent} from '../offer/offer-card/offer-card.component';
import {SnackBarComponent} from '@shared/snack-bar/snack-bar.component';
import {ConfirmationModalComponent} from '@shared/confirmation-modal/confirmation-modal.component';
import {NgZorroExportsModule} from '@shared/ngZorroExports.module';
import {MaterialUIExportsModule} from '@shared/materialUIExports.module';
import {OfferDetailsComponent} from '../offer/offer-details/offer-details.component';
import {ContactComponent} from '../contact/contact.component';


const components = [
  LayoutComponent,
  LoginComponent,
  OfferListComponent,
  OfferCardComponent,
  OfferDetailsComponent,
  SnackBarComponent,
  ConfirmationModalComponent,
  ContactComponent
];

const basicModules = [
  RouterModule,
  FormsModule,
  CommonModule,
  ReactiveFormsModule
]

// const modals = [];

// const pipes = [];


@NgModule({
  declarations: [...components],
  imports: [
    ...basicModules,
    NgZorroExportsModule,
    MaterialUIExportsModule,
  ],
  providers: [],
  exports: [
    ...components,
    ...basicModules,
    NgZorroExportsModule,
    MaterialUIExportsModule,
    // ...directives,
    // ...pipes,
  ],
})
export class SharedModule {
}
