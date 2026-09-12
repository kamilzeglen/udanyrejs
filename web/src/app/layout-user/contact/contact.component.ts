import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailFacade } from '@state/email';
import { ReplaySubject, takeUntil } from 'rxjs';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferFacade } from '@state/offer';
import { Offer } from '@interfaces';
import { environment } from '@environment';
import { SeoService } from '@core/seo/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public offer: Offer;
  public WEB_URL = environment.WEB_URL;

  contactForm: FormGroup;

  employees = [
    {
      name: 'Pracownik #1',
      phone: '+48 123 456 789',
      email: 'pracownik1@udanyrejs.pl',
      photo: 'assets/employees/iwona.png',
    },
    {
      name: 'Pracownik #2',
      phone: '+48 123 456 789',
      email: 'pracownik2@udanyrejs.pl',
      photo: 'assets/employees/anna.png',
    },
  ];

  constructor(
    private readonly emailFacade: EmailFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly offerFacade: OfferFacade,
    private readonly router: Router,
    private readonly seoService: SeoService,
  ) {
    this.seoService.setPageMeta({
      title: 'UdanyRejs - Kontakt',
      description:
        'Masz pytania? Skontaktuj się z nami! Jesteśmy do Twojej dyspozycji, aby pomóc Ci znaleźć idealny rejs.',
      path: this.router.url,
    });
  }

  public ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      offer: [''],
      message: ['', Validators.required],
    });

    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const offerId = paramMap.get('offerId');

      if (!offerId) {
        return;
      }

      this.offerFacade.getOffer({ id: offerId });

      this.offerFacade.getOfferSuccess$.pipe(takeUntil(this.destroy$)).subscribe(({ offer }) => {
        this.contactForm.patchValue({
          offer: offer.name,
        });
        this.contactForm.get('offer')?.disable();

        this.offer = offer;
      });
    });

    this.emailFacade.sendEmailSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo('Pomyślnie wysłąno wiadomość. Wkrótce się skontaktujemy');
    });

    this.emailFacade.sendEmailError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError('Błąd podczas wysyłania wiadomości');
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.emailFacade.sendEmail({
        name: this.contactForm.get('name').value,
        email: this.contactForm.get('email').value,
        offerURL: this.offer ? this.WEB_URL + '/offers/details/' + this.offer.id : null,
        message: this.contactForm.get('message').value,
      });
    }
  }
}
