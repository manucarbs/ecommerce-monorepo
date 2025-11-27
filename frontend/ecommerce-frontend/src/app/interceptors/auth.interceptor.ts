import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP que agrega automáticamente el token de Auth0
 * a todas las peticiones hacia el backend
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Solo agregar token a peticiones al backend
  if (req.url.includes('localhost:8080') || req.url.includes('/api/')) {
    console.log('🔐 Interceptor: Agregando token a la petición:', req.url);

    return auth.getAccessTokenSilently().pipe(
      mergeMap(token => {
        console.log('✅ Token obtenido:', token ? 'Sí (oculto por seguridad)' : 'No');
        
        // Clonar la petición y agregar el header Authorization
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('📤 Headers enviados:', {
          Authorization: token ? 'Bearer [TOKEN]' : 'Sin token',
          'Content-Type': clonedReq.headers.get('Content-Type')
        });

        return next(clonedReq);
      }),
      catchError(error => {
        console.error('❌ Error al obtener token:', error);
        // Si falla la obtención del token, continuar sin él
        return next(req);
      })
    );
  }

  // Para otras peticiones (no al backend), continuar sin modificar
  return next(req);
};