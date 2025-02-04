import {LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {registerLocaleData} from '@angular/common';
import pl from '@angular/common/locales/pl';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {effects, facades, reducers} from '@state';
import {JwtModule} from '@auth0/angular-jwt';
import {AuthGuard} from '@core/_guard/auth-guard.service';
import {SharedModule} from '@shared/shared.module';
import {AppRoutingModule} from './app-routing.module';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import {LayoutComponent} from './layout/layout.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {FooterComponent} from './layout/footer/footer.component';
import {CoreModule} from '@core/core.module';
import { DatepickerCustomHeaderComponent } from '@shared/datepicker-custom-header/datepicker-custom-header.component';

registerLocaleData(pl);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY', // Format do parsowania
  },
  display: {
    dateInput: 'DD.MM.YYYY', // Format wyświetlania w polu
    monthYearLabel: 'MMMM YYYY', // Format w nagłówku miesiąca
    dateA11yLabel: 'LL', // Dostępność
    monthYearA11yLabel: 'MMMM YYYY', // Dostępność
  },
};

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

const components = [
  AppComponent,
  LayoutComponent,
  NavbarComponent,
  FooterComponent
];

const guards = [
  AuthGuard,
];

@NgModule({
  declarations: [
    ...components,
    DatepickerCustomHeaderComponent,
  ],
  imports: [
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot(effects),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
    SharedModule,
    CoreModule,
    AppRoutingModule,
  ],
  providers: [
    ...facades,
    ...guards,
    provideHttpClient(),
    provideAnimationsAsync(),
    // { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: LOCALE_ID, useValue: 'pl' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
