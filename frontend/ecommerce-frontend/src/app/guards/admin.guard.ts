import { Injectable, inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.auth.user$.pipe(
      take(1),
      map(user => {
        // Lógica simple: si el usuario está autenticado, permitir acceso
        // En producción, aquí verificarías roles/permissions
        if (user) {
          console.log('✅ Usuario autenticado, permitiendo acceso al admin');
          return true;
        }
        
        console.log('❌ Usuario no autenticado, redirigiendo a login');
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        console.log('❌ Error de autenticación');
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}