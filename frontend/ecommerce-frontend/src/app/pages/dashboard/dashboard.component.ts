import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe],
  template: `
    <div class="dashboard">
      <header>
        <h1>Dashboard</h1>
        <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
      </header>

      <div class="content">
        <div *ngIf="auth.user$ | async as user; else guest">
          <div class="welcome-card">
            <img [src]="user.picture" [alt]="user.name" class="avatar">
            <h2>Hola, {{ user.name }}!</h2>
            <p class="email">{{ user.email }}</p>
          </div>

          <div class="info-card">
            <h3>Información de Usuario</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Usuario ID:</span>
                <span class="value">{{ user.sub }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email verificado:</span>
                <span class="value">{{ user.email_verified ? '✅ Sí' : '❌ No' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Última actualización:</span>
                <span class="value">{{ user.updated_at | date:'short' }}</span>
              </div>
            </div>
          </div>

          <button (click)="goHome()" class="btn-secondary">Volver al Inicio</button>
        </div>

        <ng-template #guest>
          <h1>Bienvenido a Mi Aplicación</h1>
          <p>Por favor inicia sesión para continuar</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f8f9fa;
    }

    header {
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header h1 {
      margin: 0;
      color: #333;
    }

    .content {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }

    .welcome-card, .info-card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .welcome-card {
      text-align: center;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin-bottom: 20px;
    }

    .welcome-card h2 {
      color: #333;
      margin: 10px 0;
    }

    .email {
      color: #666;
      font-size: 14px;
    }

    .info-card h3 {
      color: #333;
      margin-bottom: 20px;
      border-bottom: 2px solid #0066cc;
      padding-bottom: 10px;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .label {
      font-weight: bold;
      color: #555;
    }

    .value {
      color: #333;
    }

    button {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .btn-logout {
      background: #dc3545;
      color: white;
    }

    .btn-logout:hover {
      background: #c82333;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      display: block;
      margin: 20px auto 0;
    }

    .btn-secondary:hover {
      background: #545b62;
    }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout({
      logoutParams: { returnTo: window.location.origin }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
