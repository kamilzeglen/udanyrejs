import { NavigationExtras } from '@angular/router';

export interface ChangeRoutePayload {
  linkParams: any[];
  extras?: NavigationExtras;
}
