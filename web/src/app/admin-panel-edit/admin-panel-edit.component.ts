import {Component, OnDestroy, OnInit} from '@angular/core';
import {Company} from '../_interfaces/company';
import {HttpService} from '../_shared/http/http.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReplaySubject, take} from 'rxjs';
import {Offer} from '../_interfaces/offer';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-admin-panel-edit',
  templateUrl: './admin-panel-edit.component.html',
  styleUrl: './admin-panel-edit.component.scss'
})
export class AdminPanelEditComponent implements OnInit, OnDestroy {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  public offerID: string;
  public offerForm: FormGroup;
  public companies = Object.keys(Company);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly offersService: HttpService,
    private readonly fb: FormBuilder) {
  }

ngOnInit(): void {
  this.offerForm = this.fb.group({
    name: ['', Validators.required],
    company: ['', Validators.required],
    price: ['', Validators.required],
    shipName: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    pdfUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
    imageFileName: [null],
    image: [null],
    itinerary: this.fb.array([]) // Tworzymy pustą tablicę, którą zapełnimy, jeśli dane istnieją
  });

  // Pobieranie ID z URL
  this.offerID = this.route.snapshot.paramMap.get('id');

  // Pobieranie danych oferty i wypełnianie formularza
  if (this.offerID) {
    this.offersService.getOfferDetails(this.offerID).pipe(take(1)).subscribe((data: Offer) => {
      this.offerForm.patchValue({
        name: data.name,
        company: data.company,
        price: data.price,
        shipName: data.shipName,
        startDate: data.startDate,
        endDate: data.endDate,
        imageFileName: data.imageFileName,
        image: data.image
      });
    });
  }

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
    console.log(file)

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        this.offerForm.patchValue({
          image: base64String
        });
      };

      reader.readAsDataURL(file); // Wczytuje plik jako Base64
    }
  }

  submitForm() {
    if (this.offerForm.valid) {
      const offerData: Offer = this.offerForm.value;
      console.log(offerData);
      this.offersService.createOffer(offerData).pipe(take(1)).subscribe((response) => {
        console.log(response);
      })
    } else {
      console.log('invalid')
    }
  }
}
