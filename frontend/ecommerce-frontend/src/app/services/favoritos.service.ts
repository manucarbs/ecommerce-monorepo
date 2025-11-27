import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Favorito } from '../interface/IFavorito';


@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/favoritos';
  
  // Estado reactivo
  favoritos = signal<Favorito[]>([]);
  idsFavoritos = signal<number[]>([]);
  
  /**
   * Cargar todos los favoritos del usuario
   */
  cargarFavoritos(): Observable<Favorito[]> {
    console.log('📋 Cargando favoritos completos...');
    return this.http.get<Favorito[]>(this.apiUrl).pipe(
      tap(favs => {
        console.log('✅ Favoritos cargados:', favs.length);
        this.favoritos.set(favs);
        this.idsFavoritos.set(favs.map(f => f.productoId));
      }),
      catchError(this.handleError('cargarFavoritos'))
    );
  }
  
  /**
   * Cargar solo los IDs (más ligero)
   */
  cargarIdsFavoritos(): Observable<number[]> {
    console.log('🔢 Cargando IDs de favoritos...');
    return this.http.get<number[]>(`${this.apiUrl}/ids`).pipe(
      tap(ids => {
        console.log('✅ IDs cargados:', ids);
        this.idsFavoritos.set(ids);
      }),
      catchError(this.handleError('cargarIdsFavoritos'))
    );
  }
  
  /**
   * Agregar a favoritos
   */
  agregar(productoId: number): Observable<Favorito> {
    console.log('❤️ Agregando a favoritos:', productoId);
    const body = { productoId };
    console.log('📤 Body enviado:', body);
    
    return this.http.post<Favorito>(this.apiUrl, body).pipe(
      tap(favorito => {
        console.log('✅ Favorito agregado:', favorito);
        // Actualizar estado local inmediatamente
        const idsActuales = [...this.idsFavoritos()];
        if (!idsActuales.includes(productoId)) {
          idsActuales.push(productoId);
          this.idsFavoritos.set(idsActuales);
        }
      }),
      catchError(this.handleError('agregar'))
    );
  }
  
  /**
   * Eliminar de favoritos
   */
  eliminar(productoId: number): Observable<any> {
    console.log('💔 Eliminando de favoritos:', productoId);
    
    return this.http.delete(`${this.apiUrl}/${productoId}`).pipe(
      tap(() => {
        console.log('✅ Favorito eliminado');
        // Actualizar estado local inmediatamente
        const idsActuales = this.idsFavoritos().filter(id => id !== productoId);
        this.idsFavoritos.set(idsActuales);
      }),
      catchError(this.handleError('eliminar'))
    );
  }
  
  /**
   * Toggle favorito (recomendado para botones)
   */
  toggle(productoId: number): Observable<any> {
    console.log('🔄 Toggle favorito:', productoId);
    const body = { productoId };
    console.log('📤 Body enviado:', body);
    console.log('📍 URL:', `${this.apiUrl}/toggle`);
    
    return this.http.post(`${this.apiUrl}/toggle`, body).pipe(
      tap(response => {
        console.log('✅ Toggle exitoso. Respuesta:', response);
        
        // Actualizar estado local
        const idsActuales = [...this.idsFavoritos()];
        const index = idsActuales.indexOf(productoId);
        
        if (index > -1) {
          // Estaba en favoritos, ahora se eliminó
          idsActuales.splice(index, 1);
          console.log('💔 Eliminado de favoritos localmente');
        } else {
          // No estaba, ahora se agregó
          idsActuales.push(productoId);
          console.log('❤️ Agregado a favoritos localmente');
        }
        
        this.idsFavoritos.set(idsActuales);
      }),
      catchError(this.handleError('toggle'))
    );
  }
  
  /**
   * Verificar si un producto es favorito
   */
  esFavorito(productoId: number): boolean {
    return this.idsFavoritos().includes(productoId);
  }
  
  /**
   * Contar favoritos
   */
  contarFavoritos(): Observable<{ cantidad: number }> {
    return this.http.get<{ cantidad: number }>(`${this.apiUrl}/count`).pipe(
      catchError(this.handleError('contarFavoritos'))
    );
  }
  
  /**
   * Manejador de errores centralizado
   */
  private handleError(operacion: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`❌ Error en ${operacion}:`, error);
      
      let mensajeError = 'Error desconocido';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        mensajeError = `Error del cliente: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        mensajeError = `Error del servidor: ${error.status} ${error.statusText}`;
        
        // Mostrar detalles adicionales
        console.error('📋 Detalles completos:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          mensaje: error.error?.mensaje || error.message,
          error: error.error
        });
        
        // Mensajes específicos según el código de error
        switch (error.status) {
          case 400:
            mensajeError = 'Solicitud inválida. Verifica los datos enviados.';
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
            mensajeError = error.error?.mensaje || 'El favorito ya existe.';
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