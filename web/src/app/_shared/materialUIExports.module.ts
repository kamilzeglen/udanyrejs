import { NgModule } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialogModule} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDividerModule} from '@angular/material/divider';
import {MatNativeDateModule} from '@angular/material/core';
import {MatList, MatListItem} from '@angular/material/list';

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
  MatDividerModule,
  MatNativeDateModule,
  MatList,
  MatListItem
];

@NgModule({
  imports: [...materialModules],
  exports: [...materialModules],
  declarations: [],
  providers: [],
})
export class MaterialUIExportsModule {}
