import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { environment } from '@environment';
import { groupRouteMapStopsByLocation, RouteMapLocation } from '@core/utils/group-route-map-stops-by-location.util';

export interface RouteMapStop {
  day: number;
  city: string;
  latitude: number;
  longitude: number;
}

const DEFAULT_MARKER_FILTER = 'none';
const START_MARKER_FILTER = 'hue-rotate(100deg) saturate(1.6)';
const END_MARKER_FILTER = 'hue-rotate(300deg) saturate(1.8) brightness(0.95)';

function buildMarkerIcon(filter: string): L.DivIcon {
  return L.divIcon({
    className: 'route-map-marker',
    html: `<img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png" style="width:100%;height:100%;filter:${filter}" />`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

function pickMarkerFilter(location: RouteMapLocation, startDay: number, endDay: number): string {
  if (location.days.includes(startDay)) {
    return START_MARKER_FILTER;
  }

  if (location.days.includes(endDay)) {
    return END_MARKER_FILTER;
  }

  return DEFAULT_MARKER_FILTER;
}

function buildPopupContent(location: RouteMapLocation): string {
  return `${location.days.join(', ')}. dzień — ${location.city}`;
}

@Component({
  selector: 'app-offer-route-map',
  standalone: true,
  template: '<div class="route-map" #mapContainer></div>',
  styleUrl: './offer-route-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferRouteMapComponent implements AfterViewInit, OnDestroy {
  public stops = input.required<RouteMapStop[]>();

  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private map: L.Map;
  private resizeObserver: ResizeObserver;

  public ngAfterViewInit(): void {
    const containerElement = this.mapContainer().nativeElement;
    this.map = L.map(containerElement, { scrollWheelZoom: false });

    L.tileLayer(`https://api.maptiler.com/maps/aquarelle-v4/{z}/{x}/{y}.png?key=${environment.MAPTILER_KEY}`, {
      attribution: '© MapTiler © OpenStreetMap contributors',
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(this.map);

    const stopsList = this.stops();
    const latLngs: L.LatLngExpression[] = stopsList.map((stop) => [stop.latitude, stop.longitude]);
    const startDay = stopsList[0].day;
    const endDay = stopsList[stopsList.length - 1].day;

    groupRouteMapStopsByLocation(stopsList).forEach((location) => {
      const icon = buildMarkerIcon(pickMarkerFilter(location, startDay, endDay));

      L.marker([location.latitude, location.longitude], { icon })
        .addTo(this.map)
        .bindPopup(buildPopupContent(location));
    });

    L.polyline(latLngs, { color: '#0a6b4f', weight: 3 }).addTo(this.map);
    this.map.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });

    this.resizeObserver = new ResizeObserver(() => {
      this.map.invalidateSize();
    });
    this.resizeObserver.observe(containerElement);
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }
}
