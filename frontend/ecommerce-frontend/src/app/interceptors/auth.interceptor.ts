import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Solo agregar token a peticiones al backend
  if (req.url.includes('localhost:8080') || req.url.includes('/api/')) {
    console.log('🔐 Interceptor: Agregando token a la petición:', req.url);

    return auth.getAccessTokenSilently().pipe(
      mergeMap(token => {
        console.log('✅ Token obtenido EXITOSAMENTE');
        console.log('📦 Token (primeros 20 chars):', token.substring(0, 20) + '...');
        
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': req.headers.get('Content-Type') || 'application/json'
          }
        });

        return next(clonedReq);
      }),
      catchError(error => {
        console.error('❌ ERROR DETALLADO en getAccessTokenSilently():');
        console.error('Error object:', error);
        console.error('Error code:', error.error);
        console.error('Error description:', error.error_description);
        console.error('Error message:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        
        // IMPORTANTE: No continuar sin token, lanzar el error
        return throwError(() => new Error(`No se pudo obtener token: ${error.error || error.message}`));
      })
    );
  }

  return next(req);
};