import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoCreate, ProductoconDetalle } from '../interface/IProducto'; // 🆕 Agregar ProductoconDetalle
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '../../environments/environment';
import { withAuthHeaders$ } from './_api-helpers';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = `${environment.apiUri}/api/private/producto`;

  getAll(): Observable<Producto[]> {
    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.get<Producto[]>(this.base, { headers }),
      '/productos'
    );
  }

  getMine(): Observable<Producto[]> {
    const url = `${this.base}/mine`;
    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.get<Producto[]>(url, { headers }),
      '/mis-productos'
    );
  }

  // 🆕 CORREGIR: Cambiar Producto por ProductoconDetalle
  getById(id: number): Observable<ProductoconDetalle> {
    const url = `${this.base}/${id}`;
    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.get<ProductoconDetalle>(url, { headers }), // 🆕 Cambiar aquí también
      '/productos'
    );
  }

  create(body: ProductoCreate): Observable<Producto> {
    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.post<Producto>(this.base, body, { headers }),
      '/vender'
    );
  }

  update(id: number, body: ProductoCreate): Observable<Producto> {
    const url = `${this.base}/${id}`;
    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.put<Producto>(url, body, { headers }),
      '/mis-productos'
    );
  }

  /** Eliminar */
  delete(id: number): Observable<void> {
    const url = `${this.base}/${id}`;
    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.delete<void>(url, { headers }),
      '/mis-productos'
    );
  }

  // ========== UPLOAD DE IMÁGENES ==========

  /**
   * Sube UNA imagen a Cloudinary
   */
  uploadImage(file: File): Observable<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'productos');

    const filesUrl = `${environment.apiUri}/api/private/files/upload`;

    return withAuthHeaders$(
      this.auth,
      (headers) =>
        this.http.post<{ url: string; filename: string; size: number }>(filesUrl, formData, {
          headers,
        }),
      '/vender'
    );
  }

  /**
   * Sube MÚLTIPLES imágenes a Cloudinary
   */
  uploadMultipleImages(files: File[]): Observable<{
    files: Array<{ url: string; filename: string; size: number }>;
    count: number;
    errors: string[];
  }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', 'productos');

    const filesUrl = `${environment.apiUri}/api/private/files/upload-multiple`;

    return withAuthHeaders$(
      this.auth,
      (headers) => this.http.post<any>(filesUrl, formData, { headers }),
      '/vender'
    );
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  deleteImage(url: string): Observable<{ message: string }> {
    const filesUrl = `${environment.apiUri}/api/private/files`;

    return withAuthHeaders$(
      this.auth,
      (headers) =>
        this.http.delete<{ message: string }>(filesUrl, {
          headers,
          body: { url },
        }),
      '/mis-productos'
    );
  }
}