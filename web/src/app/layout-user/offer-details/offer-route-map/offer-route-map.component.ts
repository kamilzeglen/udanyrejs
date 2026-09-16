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
const ROUTE_LINE_COLOR = '#0a4c6b';

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

interface SegmentGeometry {
  midpoint: L.LatLng;
  rotationDeg: number;
}

// Leaflet rysuje linię w rzutowanej przestrzeni Merkatora, gdzie zwykła
// średnia stopni lat/lng NIE leży na tej linii (rzut jest nieliniowy względem
// szerokości geograficznej) - dlatego środek i kąt liczymy w tej samej
// przestrzeni projekcji co polyline, a dopiero środek rzutujemy z powrotem.
function computeSegmentGeometry(map: L.Map, from: RouteMapStop, to: RouteMapStop): SegmentGeometry {
  const fromPoint = map.project([from.latitude, from.longitude], 0);
  const toPoint = map.project([to.latitude, to.longitude], 0);
  const midpointPoint = fromPoint.add(toPoint).divideBy(2);

  return {
    midpoint: map.unproject(midpointPoint, 0),
    rotationDeg: (Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x) * 180) / Math.PI,
  };
}

// Trójkąt jako SVG polygon z jawnym rotate(kąt, cx, cy) w tym samym układzie
// współrzędnych co jego punkty - w przeciwieństwie do trójkąta z obramowań CSS,
// gdzie box obrysu nie pokrywa się z punktem zakotwiczenia ikony, więc zarówno
// grot, jak i środek obrotu, lądowały poza faktycznym punktem na linii.
function buildArrowIcon(rotationDeg: number): L.DivIcon {
  return L.divIcon({
    className: 'route-map-arrow',
    html: `
      <svg class="route-map-arrow__glyph" viewBox="0 0 24 24" width="24" height="24">
        <polygon points="4,6 4,18 12,12" fill="${ROUTE_LINE_COLOR}" transform="rotate(${rotationDeg} 12 12)" />
      </svg>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function isSameStopLocation(a: RouteMapStop, b: RouteMapStop): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
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

    L.polyline(latLngs, { color: ROUTE_LINE_COLOR, weight: 3 }).addTo(this.map);
    this.map.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });

    for (let stopIndex = 0; stopIndex < stopsList.length - 1; stopIndex++) {
      const fromStop = stopsList[stopIndex];
      const toStop = stopsList[stopIndex + 1];

      if (isSameStopLocation(fromStop, toStop)) {
        continue;
      }

      const { midpoint, rotationDeg } = computeSegmentGeometry(this.map, fromStop, toStop);
      const icon = buildArrowIcon(rotationDeg);

      L.marker(midpoint, { icon, interactive: false }).addTo(this.map);
    }

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
