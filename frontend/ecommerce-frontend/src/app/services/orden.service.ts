import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Orden, EstadisticasVendedor } from '../interface/IOrden';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUri;

  // Obtener órdenes del vendedor
  getOrdenesVendedor(): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${this.apiUrl}/api/ordenes/vendedor`);
  }

  // Obtener estadísticas
  getEstadisticasVendedor(): Observable<EstadisticasVendedor> {
    return this.http.get<EstadisticasVendedor>(`${this.apiUrl}/api/ordenes/vendedor/estadisticas`);
  }

  // Obtener órdenes recientes del vendedor
  getOrdenesRecientesVendedor(): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${this.apiUrl}/api/ordenes/vendedor/recientes`);
  }

  // Obtener productos más vendidos
  getProductosMasVendidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/ordenes/vendedor/productos-mas-vendidos`);
  }

  // Obtener orden específica
  getOrden(id: string): Observable<Orden> {
    return this.http.get<Orden>(`${this.apiUrl}/api/ordenes/${id}`);
  }

  // Actualizar estado de envío
  actualizarEstadoEnvio(ordenId: string, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/ordenes/${ordenId}/envio`, { estado });
  }

  // Agregar número de tracking
  agregarTracking(ordenId: string, trackingNumber: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/ordenes/${ordenId}/tracking`, { trackingNumber });
  }

  // Obtener órdenes por estado
  getOrdenesPorEstado(estado: string): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${this.apiUrl}/api/ordenes?estado=${estado}`);
  }

  // Obtener ventas por período
  getVentasPorPeriodo(inicio: string, fin: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/ordenes/ventas?inicio=${inicio}&fin=${fin}`);
  }
}