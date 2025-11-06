// src/app/guards/provision.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UsuarioService } from '../services/usuario.service';
import { firstValueFrom, of } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProvisionGuard implements CanActivate {
  private auth = inject(AuthService);
  private usuario = inject(UsuarioService);
  private router = inject(Router);

  private static alreadyProvisioned = false;

  async canActivate(): Promise<boolean | UrlTree> {

    const isAuth = await firstValueFrom(
      this.auth.isAuthenticated$.pipe(filter(v => v !== null), take(1))
    );

    if (!isAuth) {
      this.auth.loginWithRedirect({ appState: { target: '/privado' } });
      return false;
    }

    if (!ProvisionGuard.alreadyProvisioned) {
      await firstValueFrom(
        this.usuario.provisionMe().pipe(
          catchError(e => { return of(null); })
        )
      );
     
      ProvisionGuard.alreadyProvisioned = true;
    } else {
    }

    return true;
  }
}
