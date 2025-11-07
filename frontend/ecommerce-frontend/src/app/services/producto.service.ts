import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoCreate } from '../interface/IProducto';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../environments/environment';
import { withAuthHeaders$ } from './_api-helpers';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = `${environment.apiUri}/api/private/producto`;

  getAll(): Observable<Producto[]> {
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.get<Producto[]>(this.base, { headers }),
      '/productos'
    );
  }

  getMine(): Observable<Producto[]> {
    const url = `${this.base}/mine`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.get<Producto[]>(url, { headers }),
      '/mis-productos'
    );
  }

  getById(id: number): Observable<Producto> {
    const url = `${this.base}/${id}`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.get<Producto>(url, { headers }),
      '/productos'
    );
  }

  create(body: ProductoCreate): Observable<Producto> {
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.post<Producto>(this.base, body, { headers }),
      '/vender'
    );
  }

  update(id: number, body: ProductoCreate): Observable<Producto> {
    const url = `${this.base}/${id}`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.put<Producto>(url, body, { headers }),
      '/mis-productos'
    );
  }

  /** Eliminar */
  delete(id: number): Observable<void> {
    const url = `${this.base}/${id}`;
    return withAuthHeaders$(this.auth, (headers) =>
      this.http.delete<void>(url, { headers }),
      '/mis-productos'
    );
  }
}
