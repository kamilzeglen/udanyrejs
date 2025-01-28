import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SnackBarComponent} from '@shared/snack-bar/snack-bar.component';
import {ConfirmationModalComponent} from '@shared/confirmation-modal/confirmation-modal.component';
import {NgZorroExportsModule} from '@shared/ngZorroExports.module';
import {MaterialUIExportsModule} from '@shared/materialUIExports.module';
import {SpinnerComponent} from '@shared/spinner/spinner.component';
import {AutoSpinnerDirective} from '@shared/_directive/auto-spinner.directive';
import {SubMenuComponent} from '../layout/sub-menu/sub-menu.component';
import {NgSelectModule} from '@ng-select/ng-select';


const components = [
  SnackBarComponent,
  ConfirmationModalComponent,
  SpinnerComponent,
  SubMenuComponent
];

const basicModules = [
  RouterModule,
  FormsModule,
  CommonModule,
  ReactiveFormsModule,
  NgSelectModule
]

const directives = [
  AutoSpinnerDirective
];

// const modals = [];


// const pipes = [];


@NgModule({
  declarations: [...components, ...directives],
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
    ...directives,
    // ...pipes,
  ],
})
export class SharedModule {
}
