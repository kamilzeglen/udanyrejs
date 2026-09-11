import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferCardComponent } from './offer-card.component';

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
