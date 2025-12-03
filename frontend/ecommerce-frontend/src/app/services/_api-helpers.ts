// src/app/services/_api-helpers.ts (Angular) - con logs adicionales
import { HttpHeaders } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, take, catchError, tap } from 'rxjs/operators';
import { AuthService } from '@auth0/auth0-angular';

export function withAuthHeaders$<T>(
  auth: AuthService,
  fn: (headers: HttpHeaders) => Observable<T>,
  redirectOn401To: string = '/'
): Observable<T> {
  return from(auth.getAccessTokenSilently()).pipe(
    take(1),
    tap((token) => console.debug('[AUTH] token acquired (len):', token?.length ?? 0)),
    switchMap(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return fn(headers);
    }),
    catchError(err => {
      console.error('[AUTH] withAuthHeaders$ ERROR:', err);
      if (err?.status === 401) {
        auth.loginWithRedirect({ appState: { target: redirectOn401To } });
      }
      return throwError(() => err);
    })
  );
}
