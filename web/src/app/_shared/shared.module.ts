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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';
import {NzInputGroupComponent} from 'ng-zorro-antd/input';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzTimePickerComponent} from 'ng-zorro-antd/time-picker';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzCardModule} from 'ng-zorro-antd/card';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {LayoutComponent} from '@shared/layout/layout.component';
import {LoginComponent} from '@shared/login/login.component';
import {NzTableComponent, NzTableModule} from 'ng-zorro-antd/table';
import {OfferListComponent} from '../offer/offer-list/offer-list.component';
import {OfferCardComponent} from '../offer/offer-card/offer-card.component';

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
  MatDividerModule
];

const ngZorroModules = [
  NzInputGroupComponent,
  NzDatePickerModule,
  NzUploadModule,
  NzDividerModule,
  NzTimePickerComponent,
  NzSelectModule,
  NzFormModule,
  NzButtonModule,
  NzIconModule,
  NzCardModule,
  NzTableModule,
  NzTableComponent
];

const components = [
  LayoutComponent,
  LoginComponent,
  OfferListComponent,
  OfferCardComponent
];

const basicModules = [
  RouterModule,
  FormsModule,
  CommonModule,
  ReactiveFormsModule
]

// const modals = [];

// const pipes = [];

// const directives = [];


@NgModule({
  declarations: [...components],
  imports: [
    ...basicModules,
    ...materialModules,
    ...ngZorroModules,
    NgOptimizedImage,
  ],
  providers: [],
  exports: [
    ...basicModules,
    ...materialModules,
    ...ngZorroModules,
    ...components,
    // ...directives,
    // ...pipes,
  ],
})
export class SharedModule {
}
