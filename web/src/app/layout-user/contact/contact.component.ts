import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EmailFacade} from '@state/email';
import {ReplaySubject, takeUntil} from 'rxjs';
import {SnackbarService} from '@shared/snack-bar/snack-bar.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  contactForm: FormGroup;

  employees = [
    {
      name: 'Iwona Jarząbek-Żegleń',
      phone: '+48 601 290 334',
      email: 'iwona.zeglen@udanyrejs.pl',
      photo: 'assets/employees/iwona.png'
    },
    {
      name: 'Anna Sidor',
      phone: '+48 507 444 903',
      email: 'anna.sidor@udanyrejs.pl',
      photo: 'assets/employees/anna.png'
    }
  ];

  constructor(
    private readonly emailFacade: EmailFacade,
    private readonly fb: FormBuilder,
    private readonly snackService: SnackbarService,
  ) {
  }

  public ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    })

    this.emailFacade.sendEmailSuccess$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showInfo("Pomyślnie wysłąno wiadomość. Wkrótce sie odezwiemy")
    })


    this.emailFacade.sendEmailError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackService.showError("Błąd podczas wysyłania wiadomości")
    })
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.emailFacade.sendEmail(this.contactForm.getRawValue())
    }
  }
}
