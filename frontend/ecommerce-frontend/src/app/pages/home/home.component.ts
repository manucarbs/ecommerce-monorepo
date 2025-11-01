import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="container">
      @if (auth.isAuthenticated$ | async) {
        <div class="authenticated">
          <h1>¡Bienvenido de vuelta!</h1>
          <div class="user-info">
            @if (auth.user$ | async; as user) {
              <img [src]="user.picture" [alt]="user.name" class="avatar">
              <p><strong>Nombre:</strong> {{ user.name }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
            }
          </div>
          <div class="actions">
            <button (click)="goToDashboard()" class="btn-primary">Ir al Dashboard</button>
            <button (click)="logout()" class="btn-secondary">Cerrar Sesión</button>
          </div>
        </div>
      } @else {
        <div class="guest">
          <h1>Bienvenido a Mi Aplicación</h1>
          <p>Por favor inicia sesión para continuar</p>
          <button (click)="login()" class="btn-primary">Iniciar Sesión con Auth0</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 20px 0;
    }

    .user-info {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .user-info p {
      margin: 10px 0;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #0066cc;
      color: white;
    }

    .btn-primary:hover {
      background: #0052a3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
    }

    .guest p {
      color: #666;
      margin-bottom: 30px;
    }
  `]
})
export class HomeComponent {
  auth = inject(AuthService);
  router = inject(Router);

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/home']);
  }
}