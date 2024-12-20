import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReplaySubject, takeUntil} from 'rxjs';
import {CommonFacade} from '@state/common';
import {OfferFacade} from 'src/app/_state/offer';

@Component({
  selector: 'app-admin-panel-add',
  templateUrl: './admin-offer-add.component.html',
  styleUrl: './admin-offer-add.component.scss'
})
export class AdminOfferAddComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies$ = this.commonFacade.companies$

  public offerForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly commonFacade: CommonFacade,
    private readonly offerFacade: OfferFacade,
  ) {}

  ngOnInit(): void {
    this.offerForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      price: ['', Validators.required],
      shipName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      pdfFileURL: ['', [Validators.required, Validators.pattern('https?://.+')]],
      imageFileName: [null],
      image: [null],
      itinerary: this.fb.array([])
    });

    // Subskrypcja zmian w polach startDate i endDate
    this.offerForm.get('startDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateItineraryDays();
    });

    this.offerForm.get('endDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateItineraryDays();
    });

    this.commonFacade.getCompanies();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get itineraryArray(): FormArray {
    return this.offerForm.get('itinerary') as FormArray;
  }

  // Obliczanie liczby dni i aktualizacja itinerary
  updateItineraryDays(): void {
    const startDate = new Date(this.offerForm.get('startDate')?.value);
    const endDate = new Date(this.offerForm.get('endDate')?.value);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const nights = Math.max(Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1, 0); // Liczba dni (z 1 jako minimum)
      this.adjustItineraryDays(nights);
    }
  }

  adjustItineraryDays(nights: number): void {
    const currentDays = this.itineraryArray.length;

    if (nights > currentDays) {
      for (let i = currentDays; i < nights; i++) {
        this.addItineraryDay(i + 1);
      }
    } else if (nights < currentDays) {
      for (let i = currentDays - 1; i >= nights; i--) {
        this.itineraryArray.removeAt(i);
      }
    }
  }

  addItineraryDay(dayNumber: number = this.itineraryArray.length + 1): void {
    const dayGroup = this.fb.group({
      day: [dayNumber],
      date: [''],
      port: [''],
      arrivalTime: [''],
      departureTime: ['']
    });
    this.itineraryArray.push(dayGroup);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        this.offerForm.patchValue({
          image: base64String
        });
      };

      reader.readAsDataURL(file);
    }
  }

  public submitForm(): void {

    // if (this.offerForm.invalid) {
    //   return
    // }

    this.offerFacade.createOffer(this.offerForm.value)
  }

  protected readonly onsubmit = onsubmit;
}
