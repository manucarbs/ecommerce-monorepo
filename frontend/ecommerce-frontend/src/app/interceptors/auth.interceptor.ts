import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { mergeMap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment'; // ajusta la ruta si es necesario

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // ✅ Solo interceptar llamadas a tu backend real
  if (req.url.startsWith(environment.apiUri)) {
    console.log('🔐 Interceptor: Agregando token a la petición:', req.url);

    return auth.getAccessTokenSilently().pipe(
      mergeMap(token => {
        const isFormData = req.body instanceof FormData;

        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            ...(isFormData ? {} : { 'Content-Type': 'application/json' })
          }
        });

        console.log('✅ Token agregado correctamente');
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
