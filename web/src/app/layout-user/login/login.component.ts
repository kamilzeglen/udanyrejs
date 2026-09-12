import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '@state/auth';
import { ActivatedRoute } from '@angular/router';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { RouterFacade } from '@state/router';
import { SeoService } from '@core/seo/seo.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  public authForm: FormGroup;
  private redirect: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authFacade: AuthFacade,
    private readonly routerFacade: RouterFacade,
    private readonly seoService: SeoService,
  ) {
    this.seoService.setPageMeta({
      title: 'UdanyRejs - Logowanie',
      description: 'Zaloguj się do panelu UdanyRejs.',
      path: '/login',
      noIndex: true,
    });
  }

  public ngOnInit(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    const { redirect } = this.activatedRoute.snapshot.queryParams;

    if (redirect) {
      this.redirect = redirect;
    }

    this.authFacade.getMyselfSuccess$
      .pipe(
        filter(({ user }) => {
          if (!user) {
            return false;
          }
          return true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const queryParams = {} as any;
        let linkParams;

        // if redirect string shorter than 4 - no redirect - its not possible
        if (this.redirect?.length >= 4) {
          const [path, queryParamsString] = this.redirect.split('?');
          linkParams = path.split('/').filter((pathPart) => !!pathPart);

          if (queryParamsString?.length) {
            queryParamsString.split('&').forEach((keyVal) => {
              const [key, val] = keyVal.split('=');
              queryParams[key] = val;
            });
          }
        }

        this.routerFacade.changeRoute({ linkParams, extras: { queryParams } });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public onSubmit(): void {
    if (this.authForm.invalid) {
      return;
    }

    const { email, password } = this.authForm.value;
    const redirect = this.redirect;
    this.authFacade.login({ email, password }, redirect);
  }
}
