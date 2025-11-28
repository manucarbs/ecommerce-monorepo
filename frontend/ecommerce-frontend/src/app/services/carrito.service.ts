import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Carrito } from '../interface/ICarrito';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/carritos';
  private stockApiUrl = 'http://localhost:8080/api/stock'; // 🆕 URL para stock
  
  // Estado reactivo - MISMA ESTRUCTURA que favoritos
  carritos = signal<Carrito[]>([]);
  idsCarrito = signal<number[]>([]);
  
  /**
   * Cargar todos los items del carrito
   */
  cargarCarrito(): Observable<Carrito[]> {
    console.log('🛒 Cargando carrito completo...');
    return this.http.get<Carrito[]>(this.apiUrl).pipe(
      tap(carritos => {
        console.log('✅ Carrito cargado:', carritos.length, 'items');
        this.carritos.set(carritos);
        this.idsCarrito.set(carritos.map(c => c.productoId));
      }),
      catchError(this.handleError('cargarCarrito'))
    );
  }
  
  /**
   * Cargar solo los IDs (más ligero)
   */
  cargarIdsCarrito(): Observable<number[]> {
    console.log('🔢 Cargando IDs del carrito...');
    return this.http.get<number[]>(`${this.apiUrl}/ids`).pipe(
      tap(ids => {
        console.log('✅ IDs del carrito cargados:', ids);
        this.idsCarrito.set(ids);
      }),
      catchError(this.handleError('cargarIdsCarrito'))
    );
  }
  
  /**
   * Agregar al carrito
   */
  agregar(productoId: number, cantidad: number = 1): Observable<Carrito> {
    console.log('➕ Agregando al carrito:', productoId, 'Cantidad:', cantidad);
    const body = { productoId, cantidad };
    console.log('📤 Body enviado:', body);
    
    return this.http.post<Carrito>(this.apiUrl, body).pipe(
      tap(carrito => {
        console.log('✅ Producto agregado al carrito:', carrito);
        // Actualizar estado local inmediatamente
        const idsActuales = [...this.idsCarrito()];
        if (!idsActuales.includes(productoId)) {
          idsActuales.push(productoId);
          this.idsCarrito.set(idsActuales);
        }
        
        // Actualizar lista completa si es necesario
        const carritosActuales = this.carritos();
        const itemExistenteIndex = carritosActuales.findIndex(item => 
          item.productoId === productoId
        );
        
        if (itemExistenteIndex >= 0) {
          carritosActuales[itemExistenteIndex] = carrito;
          this.carritos.set([...carritosActuales]);
        } else {
          this.carritos.set([...carritosActuales, carrito]);
        }
      }),
      catchError(this.handleError('agregar'))
    );
  }
  
  /**
   * Eliminar del carrito
   */
  eliminar(productoId: number): Observable<any> {
    console.log('💔 Eliminando del carrito:', productoId);
    
    return this.http.delete(`${this.apiUrl}/${productoId}`).pipe(
      tap(() => {
        console.log('✅ Producto eliminado del carrito');
        // Actualizar estado local inmediatamente
        const idsActuales = this.idsCarrito().filter(id => id !== productoId);
        this.idsCarrito.set(idsActuales);
        
        const carritosActuales = this.carritos().filter(item => 
          item.productoId !== productoId
        );
        this.carritos.set(carritosActuales);
      }),
      catchError(this.handleError('eliminar'))
    );
  }
  
  /**
   * Actualizar cantidad en el carrito
   */
  actualizarCantidad(productoId: number, cantidad: number): Observable<Carrito> {
    console.log('✏️ Actualizando cantidad:', productoId, '->', cantidad);
    
    return this.http.put<Carrito>(
      `${this.apiUrl}/${productoId}/cantidad`, 
      { cantidad }
    ).pipe(
      tap(carritoActualizado => {
        console.log('✅ Cantidad actualizada:', carritoActualizado);
        
        // Actualizar estado local
        const carritosActuales = this.carritos().map(item =>
          item.productoId === productoId ? carritoActualizado : item
        );
        this.carritos.set(carritosActuales);
      }),
      catchError(this.handleError('actualizarCantidad'))
    );
  }
  
  /**
   * 🆕 CONFIRMAR PEDIDO - Reducir stock y limpiar carrito
   */
  confirmarPedido(): Observable<any> {
    console.log('📦 Confirmando pedido y reduciendo stock...');
    
    return this.http.post<any>(`${this.stockApiUrl}/reducir`, {}).pipe(
      tap(() => {
        console.log('✅ Pedido confirmado - Stock reducido y carrito limpiado');
        // Limpiar estado local
        this.carritos.set([]);
        this.idsCarrito.set([]);
      }),
      catchError(this.handleError('confirmarPedido'))
    );
  }
  
  /**
   * Verificar si un producto está en el carrito
   */
  estaEnCarrito(productoId: number): boolean {
    return this.idsCarrito().includes(productoId);
  }
  
  /**
   * Obtener cantidad de un producto en el carrito
   */
  obtenerCantidad(productoId: number): number {
    const item = this.carritos().find(item => item.productoId === productoId);
    return item ? item.cantidad : 0;
  }
  
  /**
   * Contar items en el carrito
   */
  contarCarrito(): Observable<{ cantidad: number }> {
    return this.http.get<{ cantidad: number }>(`${this.apiUrl}/count`).pipe(
      catchError(this.handleError('contarCarrito'))
    );
  }
  
  /**
   * Obtener total del carrito
   */
  obtenerTotal(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/total`).pipe(
      catchError(this.handleError('obtenerTotal'))
    );
  }
  
  /**
   * Limpiar todo el carrito
   */
  limpiarCarrito(): Observable<any> {
    console.log('🗑️ Limpiando todo el carrito...');
    
    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        console.log('✅ Carrito limpiado completamente');
        this.carritos.set([]);
        this.idsCarrito.set([]);
      }),
      catchError(this.handleError('limpiarCarrito'))
    );
  }
  
  /**
   * Manejador de errores centralizado - MISMO que favoritos
   */
  private handleError(operacion: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`❌ Error en ${operacion}:`, error);
      
      let mensajeError = 'Error desconocido';
      
      if (error.error instanceof ErrorEvent) {
        mensajeError = `Error del cliente: ${error.error.message}`;
      } else {
        mensajeError = `Error del servidor: ${error.status} ${error.statusText}`;
        
        console.error('📋 Detalles completos:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          mensaje: error.error?.mensaje || error.message,
          error: error.error
        });
        
        switch (error.status) {
          case 400:
            mensajeError = error.error?.mensaje || 'Solicitud inválida. Verifica los datos enviados.';
            break;
          case 401:
            mensajeError = 'No autorizado. Debes iniciar sesión.';
            break;
          case 403:
            mensajeError = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            mensajeError = 'Recurso no encontrado.';
            break;
          case 409:
            mensajeError = error.error?.mensaje || 'El producto ya está en el carrito.';
            break;
          case 500:
            mensajeError = 'Error interno del servidor.';
            break;
          case 0:
            mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            break;
        }
      }
      
      console.error(`💥 ${mensajeError}`);
      return throwError(() => new Error(mensajeError));
    };
  }
}