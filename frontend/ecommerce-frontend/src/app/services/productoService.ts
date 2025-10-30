import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { Producto } from '../interface/IProducto'; 
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly baseUrl = 'http://localhost:8080'; 
  auth = inject(AuthService);
  http = inject(HttpClient);

 getProductos(): Observable<Producto[]> {
  const url =`${this.baseUrl}/producto`

  return from(this.auth.getAccessTokenSilently()).pipe(
    take(1),
    switchMap(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.get<Producto[]>(url, { headers });
    }),
    catchError(err => {
      // opcional: si expira o falta sesión, redirige a login
      if (err?.status === 401) {
        this.auth.loginWithRedirect({ appState: { target: '/productos' } });
      }
      return throwError(() => err);
    })
  );
}


  createProducto(body: Producto): Observable<Producto> {
    return from(this.auth.getAccessTokenSilently()).pipe(
    take(1),
    switchMap(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post<Producto>(`${this.baseUrl}/producto`, body, { headers });
    }),
    catchError(err => {
      // opcional: si expira o falta sesión, redirige a login
      if (err?.status === 401) {
        this.auth.loginWithRedirect({ appState: { target: '/productos' } });
      }
      return throwError(() => err);
    })
  );
  }
}
