import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {Offer} from '../_interfaces/offer';
import {Company} from '../_interfaces/company';
import {HttpService} from '../_shared/http/http.service';
import {ReplaySubject, take} from 'rxjs';

@Component({
  selector: 'app-admin-panel-add',
  templateUrl: './admin-panel-add.component.html',
  styleUrl: './admin-panel-add.component.scss'
})
export class AdminPanelAddComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public companies = Object.keys(Company);

  public offerForm = this.fb.group({
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

  constructor(
    private readonly offersService: HttpService,
    private readonly fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.offerForm.get('nights')?.valueChanges.subscribe((nights: number) => {
      this.adjustItineraryDays(nights + 1);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  get itineraryArray(): FormArray {
    return this.offerForm.get('itinerary') as FormArray;
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

  addItineraryDay(dayNumber: number = this.itineraryArray.length + 1) {
    const dayGroup = this.fb.group({
      day: [dayNumber],
      date: [''],
      port: [''],
      arrivalTime: [''],
      departureTime: ['']
    });
    this.itineraryArray.push(dayGroup);
  }

  onFileChange(event: Event) {
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

submitForm() {
  if (this.offerForm.valid) {
    const formValue = this.offerForm.value;

    const offerData: Partial<Offer> = {
      ...formValue,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      itinerary: formValue.itinerary.map((day: any) => ({
        day: day.day,
        date: new Date(day.date).toISOString(),
        port: day.port,
        arrivalTime: day.arrivalTime,
        departureTime: day.departureTime,
      }))
    };

    console.log(offerData);
    this.offersService.createOffer(offerData).pipe(take(1)).subscribe((response) => {
      console.log(response);
    });
  }
}
}
