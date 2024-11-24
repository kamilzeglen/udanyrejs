import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LayoutComponent} from '../layout/layout.component';
import {OffersComponent} from '../offers/offers.component';
import {OfferDetailsComponent} from '../offer-details/offer-details.component';
import {OfferCardComponent} from '../offer-card/offer-card.component';
import {LoginComponent} from '../login/login.component';
import {AdminPanelComponent} from '../admin-panel/admin-panel.component';
import {AdminPanelAddComponent} from '../admin-panel-add/admin-panel-add.component';
import {AdminPanelEditComponent} from '../admin-panel-edit/admin-panel-edit.component';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../app-routing.module';
import {ReactiveFormsModule} from '@angular/forms';

const materialModules = [
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatMenuModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatSnackBarModule,
  MatSortModule,
  MatSelectModule,
  MatPaginatorModule,
  MatStepperModule,
  MatRadioModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatMomentDateModule,
  MatTabsModule,
  MatDialogModule,
  MatExpansionModule,
  MatBadgeModule,
  MatChipsModule,
  MatProgressBarModule,
  MatCheckboxModule,
  MatButtonToggleModule,
  MatCardModule,
  MatSlideToggleModule,
];

const components = [
  LayoutComponent,
  OffersComponent,
  OfferDetailsComponent,
  OfferCardComponent,
  LoginComponent,
  AdminPanelComponent,
  AdminPanelAddComponent,
  AdminPanelEditComponent
];

// const modals = [];

// const pipes = [];

// const directives = [];


@NgModule({
  declarations: [...components],
  imports: [
    ...materialModules,
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [],
  exports: [
    ...materialModules,
    ...components,
    // ...directives,
    // ...pipes,
  ],
})
export class SharedModule {
}
