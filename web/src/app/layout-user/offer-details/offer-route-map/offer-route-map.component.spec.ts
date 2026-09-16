import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferRouteMapComponent } from './offer-route-map.component';

describe('OfferRouteMapComponent', () => {
  let fixture: ComponentFixture<OfferRouteMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OfferRouteMapComponent],
    });
    fixture = TestBed.createComponent(OfferRouteMapComponent);
    fixture.componentRef.setInput('stops', [
      { day: 1, city: 'Gdynia', latitude: 54.5189, longitude: 18.5305 },
      { day: 2, city: 'Kopenhaga', latitude: 55.6761, longitude: 12.5683 },
    ]);
  });

  it('renders one marker per distinct location', () => {
    fixture.detectChanges();

    const markerCount = fixture.nativeElement.querySelectorAll('.leaflet-marker-icon').length;
    expect(markerCount).toBe(2);
  });

  it('removes the underlying Leaflet map when destroyed', () => {
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('merges stops sharing the same coordinates into a single marker', () => {
    fixture.componentRef.setInput('stops', [
      { day: 10, city: 'Stambuł', latitude: 41.00824, longitude: 28.97836 },
      { day: 11, city: 'Stambuł', latitude: 41.00824, longitude: 28.97836 },
    ]);

    fixture.detectChanges();

    const markerCount = fixture.nativeElement.querySelectorAll('.leaflet-marker-icon').length;
    expect(markerCount).toBe(1);
  });

  it('gives the first and last stop a visually distinct marker from the ones in between', () => {
    fixture.componentRef.setInput('stops', [
      { day: 1, city: 'Civitavecchia', latitude: 42.09325, longitude: 11.79674 },
      { day: 2, city: 'Livorno', latitude: 43.54427, longitude: 10.32615 },
      { day: 3, city: 'Salerno', latitude: 40.67545, longitude: 14.79328 },
    ]);

    fixture.detectChanges();

    const markerImages = [...fixture.nativeElement.querySelectorAll('.leaflet-marker-icon img')] as HTMLImageElement[];
    const filters = markerImages.map((img) => img.style.filter);

    expect(filters[0]).not.toBe('none');
    expect(filters[2]).not.toBe('none');
    expect(filters[1]).toBe('none');
    expect(filters[0]).not.toBe(filters[2]);
  });

  it('shows a single-day stop popup as "day. dzień — city"', () => {
    fixture.componentRef.setInput('stops', [{ day: 5, city: 'Cannes', latitude: 43.55135, longitude: 7.01275 }]);

    fixture.detectChanges();

    const marker = fixture.nativeElement.querySelector('.leaflet-marker-icon') as HTMLElement;
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const popupText = fixture.nativeElement.querySelector('.leaflet-popup-content').textContent.trim();
    expect(popupText).toBe('5. dzień — Cannes');
  });

  it('shows a merged multi-day stop popup in the same "day, day. dzień — city" style', () => {
    fixture.componentRef.setInput('stops', [
      { day: 10, city: 'Stambuł', latitude: 41.00824, longitude: 28.97836 },
      { day: 11, city: 'Stambuł', latitude: 41.00824, longitude: 28.97836 },
    ]);

    fixture.detectChanges();

    const marker = fixture.nativeElement.querySelector('.leaflet-marker-icon') as HTMLElement;
    marker.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const popupText = fixture.nativeElement.querySelector('.leaflet-popup-content').textContent.trim();
    expect(popupText).toBe('10, 11. dzień — Stambuł');
  });
});
