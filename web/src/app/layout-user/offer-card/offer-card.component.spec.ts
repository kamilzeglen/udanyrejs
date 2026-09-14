import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferCardComponent } from './offer-card.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { OfferImageComponent } from '../offer-image/offer-image.component';

describe('OfferCardComponent cruise duration', () => {
  let fixture: ComponentFixture<OfferCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [OfferCardComponent] });
    TestBed.overrideComponent(OfferCardComponent, { set: { template: '' } });
    fixture = TestBed.createComponent(OfferCardComponent);
  });

  const cases = [
    { startDate: '2026-09-08', endDate: '2026-09-16', expected: 9 },
    { startDate: '2026-09-08', endDate: '2026-09-08', expected: 1 },
    { startDate: '2026-10-24T00:00:00+02:00', endDate: '2026-10-26T00:00:00+01:00', expected: 3 },
    { startDate: '2026-03-28T00:00:00+01:00', endDate: '2026-03-30T00:00:00+02:00', expected: 3 },
    { startDate: '2026-12-30', endDate: '2027-01-02', expected: 4 },
    { startDate: null, endDate: '2026-09-16', expected: null },
    { startDate: 'invalid', endDate: '2026-09-16', expected: null },
    { startDate: '2026-09-16', endDate: '2026-09-08', expected: null },
  ];

  for (const testCase of cases) {
    it(`counts calendar days for ${testCase.startDate} to ${testCase.endDate}`, () => {
      fixture.componentRef.setInput('offer', testCase);
      fixture.detectChanges();

      expect(fixture.componentInstance.durationDays).toBe(testCase.expected);
    });
  }

  it('updates the duration when the displayed term changes', () => {
    fixture.componentRef.setInput('offer', { startDate: '2026-09-08', endDate: '2026-09-16' });
    fixture.detectChanges();
    fixture.componentRef.setInput('offer', { startDate: '2026-10-01', endDate: '2026-10-05' });
    fixture.detectChanges();

    expect(fixture.componentInstance.durationDays).toBe(5);
  });
});

describe('OfferCardComponent image loading', () => {
  let fixture: ComponentFixture<OfferCardComponent>;
  const offer = {
    id: 'offer-1',
    termId: 'term-1',
    name: 'Rejs po Karaibach',
    imageFile: { name: 'offer-1.jpg', updatedAt: '2026-09-14T10:00:00Z' },
    company: { name: 'Armator' },
    ship: { name: 'Statek' },
    fromPrice: 10000,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, MatIconModule, OfferImageComponent],
      declarations: [OfferCardComponent],
    });
    fixture = TestBed.createComponent(OfferCardComponent);
    fixture.componentRef.setInput('offer', offer);
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();
  });

  it('prioritizes the first image and displays a skeleton until it loads', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image-container img');
    expect(image.getAttribute('fetchpriority')).toBe('high');
    expect(image.getAttribute('loading')).toBe('eager');
    expect(image.getAttribute('decoding')).toBe('async');
    expect(fixture.nativeElement.querySelector('.image-skeleton')).not.toBeNull();

    image.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.image-skeleton')).toBeNull();
    expect(image.classList.contains('is-loaded')).toBeTrue();
  });

  it('uses responsive previews and lazily loads subsequent cards', () => {
    fixture.componentRef.setInput('index', 3);
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image-container img');
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('fetchpriority')).toBe('auto');
    expect(image.src).toContain('/image-file/offer-preview/offer-1.jpg');
    expect(image.srcset).toContain('480w');
    expect(image.srcset).toContain('960w');
    expect(image.srcset).toContain('1440w');
    expect(image.srcset).toContain('v=');
  });

  it('falls back to the original once and ends loading if both sources fail', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image-container img');
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image.src).toContain('/offers/images/offer-1.jpg');
    expect(image.getAttribute('srcset')).toBeNull();
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.image-container img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.image-skeleton')).toBeNull();
    expect(fixture.nativeElement.querySelector('.image-placeholder')).not.toBeNull();
  });

  it('keeps a loaded image when only the offer term changes', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image-container img');
    image.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    fixture.componentRef.setInput('offer', { ...offer, termId: 'term-2' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.image-container img')).toBe(image);
    expect(image.classList.contains('is-loaded')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.image-skeleton')).toBeNull();
  });

  it('resets the loading state when the photo version changes', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image-container img');
    const oldSource = image.src;
    image.dispatchEvent(new Event('load'));
    fixture.componentRef.setInput('offer', {
      ...offer,
      imageFile: { ...offer.imageFile, updatedAt: '2026-09-14T11:00:00Z' },
    });
    fixture.detectChanges();

    expect(image.src).not.toBe(oldSource);
    expect(fixture.nativeElement.querySelector('.image-skeleton')).not.toBeNull();
  });
});
