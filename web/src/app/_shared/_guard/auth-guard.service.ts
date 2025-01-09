import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of, take} from "rxjs";
import {catchError, switchMap} from "rxjs/operators";
import {AuthFacade} from '@state/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authFacade: AuthFacade,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const exitUrlTree = this.router.createUrlTree(['/']); // URL przekierowania, jeśli warunek nie jest spełniony
    return this.authFacade.getMyself$(state.url).pipe(
      take(1),
      switchMap(userFromStore => {
        if (userFromStore && userFromStore.id === route.params['id']) {
          return of(true);
        } else {
          console.log("Brak access token")
          return of(exitUrlTree);
        }
      }),
      catchError(() => {
        console.log("Brak access token")
        return of(exitUrlTree)
      })
    );
  }
}
