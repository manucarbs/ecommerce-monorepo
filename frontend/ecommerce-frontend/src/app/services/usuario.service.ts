// src/app/services/usuario.service.ts (Angular) - logs en cada paso
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IUsuario, UsuarioCreateDto } from '../interface/IUsuario';
import { AuthService } from '@auth0/auth0-angular';
import { withAuthHeaders$ } from './_api-helpers';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private meSubject = new BehaviorSubject<IUsuario | null>(null);
  me$ = this.meSubject.asObservable();

  syncMe(): Observable<IUsuario> {
    const url = `${environment.apiUri}/api/private/users/me`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.get<IUsuario>(url, { headers })
    ).pipe(
      tap(u => {
        this.meSubject.next(u);
      }),
      catchError(err => {
        console.error('[USUARIO] syncMe ERROR', err);
        return of(err);
      }) as any
    );
  }

  provisionMe(): Observable<IUsuario> {
    const url = `${environment.apiUri}/api/private/users/provision`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.post<IUsuario>(url, {}, { headers })
    ).pipe(
      tap(u => {
        this.meSubject.next(u);
      }),
      catchError(err => {
        console.error('[USUARIO] provisionMe ERROR', err);
        throw err;
      })
    );
  }

  create(dto: UsuarioCreateDto): Observable<IUsuario> {
    const url = `${environment.apiUri}/api/private/users`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.post<IUsuario>(url, dto, { headers })
    ).pipe(
      tap(u => console.debug('[USUARIO] create OK', u)),
      catchError(err => {
        console.error('[USUARIO] create ERROR', err);
        throw err;
      })
    );
  }

  deleteMe(): Observable<void> {
    const url = `${environment.apiUri}/api/private/users/me`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.delete<void>(url, { headers })
    ).pipe(
      tap(() => console.debug('[USUARIO] deleteMe OK')),
      catchError(err => {
        console.error('[USUARIO] deleteMe ERROR', err);
        throw err;
      })
    );
  }

  deleteById(id: number): Observable<void> {
    const url = `${environment.apiUri}/api/private/users/${id}`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.delete<void>(url, { headers })
    ).pipe(
      tap(() => console.debug('[USUARIO] deleteById OK')),
      catchError(err => {
        console.error('[USUARIO] deleteById ERROR', err);
        throw err;
      })
    );
  }
}
