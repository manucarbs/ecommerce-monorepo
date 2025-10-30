import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);

  return auth.isAuthenticated$.pipe(
    take(1),
    map(isAuth => {
      if (isAuth) return true;
      auth.loginWithRedirect({ appState: { target: state.url } });
      return false;
    }),
    catchError(() => {
      auth.loginWithRedirect({ appState: { target: state.url } });
      return of(false);
    })
  );
};
