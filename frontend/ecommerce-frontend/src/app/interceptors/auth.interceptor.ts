import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (req.url.includes('localhost:8080') || req.url.includes('/api/')) {
    console.log('🔐 Interceptor: Agregando token a la petición:', req.url);

    return auth.getAccessTokenSilently().pipe(
      mergeMap(token => {
        console.log('✅ Token obtenido EXITOSAMENTE');
        console.log('📦 Token (primeros 20 chars):', token.substring(0, 20) + '...');
        
        // 🔥 FIX: Detectar si es FormData y NO agregar Content-Type
        const isFormData = req.body instanceof FormData;
        
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            // Solo agregar Content-Type si NO es FormData
            ...(isFormData ? {} : { 'Content-Type': 'application/json' })
          }
        });

        console.log('📤 Tipo de body:', isFormData ? 'FormData' : 'JSON');
        console.log('📤 Content-Type:', clonedReq.headers.get('Content-Type') || 'auto (browser)');

        return next(clonedReq);
      }),
      catchError(error => {
        console.error('❌ ERROR en getAccessTokenSilently():', error.message);
        return throwError(() => new Error(`No se pudo obtener token: ${error.error || error.message}`));
      })
    );
  }

  return next(req);
};