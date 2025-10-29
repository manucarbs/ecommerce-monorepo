import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../interface/IProducto'; 

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly baseUrl = 'http://localhost:8080'; 

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/producto`);
  }


  createProducto(body: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/producto`, body);
  }
}
