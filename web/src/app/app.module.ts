import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {NZ_I18N, pl_PL} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import pl from '@angular/common/locales/pl';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {effects, facades, reducers} from '@state';
import {JwtModule} from '@auth0/angular-jwt';
import {AuthGuard} from './guard/auth-guard.service';
import {SharedModule} from '@shared/shared.module';
import {AppRoutingModule} from './app-routing.module';
import {BrowserModule} from '@angular/platform-browser';
import {AdminModule} from './admin/admin.module';

registerLocaleData(pl);

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

const components = [
  AppComponent,
];

const guards = [
  AuthGuard,
];

@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot(effects),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    AdminModule,
  ],
  providers: [...facades, ...guards, provideHttpClient(), provideAnimationsAsync(), { provide: NZ_I18N, useValue: pl_PL }],
  bootstrap: [AppComponent]
})
export class AppModule { }
