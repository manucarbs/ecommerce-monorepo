import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe],
  template: `
    <div class="app-screen">
      <!-- Header -->
      <header class="top-header">
        <h1 class="logo-text">PERFIL</h1>
      </header>

      <!-- Contenido principal -->
      <main class="main-content">
        <div *ngIf="auth.user$ | async as user; else loading">
          <!-- Tarjeta de Bienvenida -->
          <section class="welcome-card">
            <div class="avatar-container">
              <img 
                [src]="user.picture || getDefaultAvatar(user)" 
                [alt]="user.name || 'Usuario'"
                class="avatar"
                (error)="onImageError($event, user)"
              >
            </div>
            <h2 class="user-name">{{ getFullName(user) }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <div class="user-badges" *ngIf="user.email_verified">
              <span class="badge verified">✓ Verificado</span>
            </div>
          </section>

          <!-- Información Personal -->
          <section class="info-card" *ngIf="hasPersonalInfo(user)">
            <h3 class="card-title">👤 Información Personal</h3>
            <div class="info-grid">
              <div class="info-item" *ngIf="user.given_name">
                <span class="label">Nombre</span>
                <span class="value">{{ user.given_name }}</span>
              </div>
              <div class="info-item" *ngIf="user.family_name">
                <span class="label">Apellidos</span>
                <span class="value">{{ user.family_name }}</span>
              </div>
              <div class="info-item" *ngIf="user.gender">
                <span class="label">Género</span>
                <span class="value">{{ user.gender }}</span>
              </div>
              <div class="info-item" *ngIf="user.birthdate">
                <span class="label">Fecha de Nacimiento</span>
                <span class="value">{{ user.birthdate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item" *ngIf="user.phone_number">
                <span class="label">Teléfono</span>
                <span class="value">{{ user.phone_number }}</span>
              </div>
              <div class="info-item" *ngIf="user.address">
                <span class="label">Dirección</span>
                <span class="value">{{ formatAddress(user.address) }}</span>
              </div>
            </div>
          </section>

          <!-- Información de la Cuenta -->
          <section class="info-card">
            <h3 class="card-title">🔐 Información de la Cuenta</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Usuario ID</span>
                <span class="value mono">{{ user.sub }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">{{ user.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email Verificado</span>
                <span class="value">{{ user.email_verified ? '✅ Sí' : '⏳ Pendiente' }}</span>
              </div>
              <div class="info-item" *ngIf="user.sub && getAuthProvider(user.sub)">
                <span class="label">Proveedor de Autenticación</span>
                <span class="value">{{ getAuthProvider(user.sub) }}</span>
              </div>
              <div class="info-item" *ngIf="user.locale">
                <span class="label">Idioma/Región</span>
                <span class="value">{{ user.locale }}</span>
              </div>
              <div class="info-item" *ngIf="user.zoneinfo">
                <span class="label">Zona Horaria</span>
                <span class="value">{{ user.zoneinfo }}</span>
              </div>
              <div class="info-item" *ngIf="user.updated_at">
                <span class="label">Última Actualización</span>
                <span class="value">{{ user.updated_at | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </section>

          <!-- Metadata adicional (si existe) -->
          <section class="info-card" *ngIf="hasMetadata(user)">
            <h3 class="card-title">📊 Información Adicional</h3>
            <div class="info-grid">
              <div class="info-item" *ngFor="let key of getMetadataKeys(user)">
                <span class="label">{{ formatKey(key) }}</span>
                <span class="value">{{ getMetadataValue(user, key) }}</span>
              </div>
            </div>
          </section>

          <!-- Botones de acción -->
          <div class="actions">
            <button (click)="goToProducts()" class="btn-primary">
              🏠 Volver a Productos
            </button>
            <button (click)="logout()" class="btn-logout">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        <ng-template #loading>
          <div class="state">
            <span>Cargando información del perfil...</span>
          </div>
        </ng-template>

        <div class="spacer"></div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --bg: #ffffff;
      --bg-soft: #f8f9fa;
      --text: #1a1a1a;
      --text-secondary: #4a5568;
      --muted: #6b7280;
      --lavender: #6667ab;
      --primary: #134842;
      --divider: #e2e8f0;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
      --radius-md: 10px;
      --radius-lg: 14px;
      
      display: block;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-soft);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .app-screen {
      background: var(--bg);
      height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      margin: 0;
      overflow: hidden;
    }

    .top-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 24px;
      background: var(--bg);
      border-bottom: 1px solid var(--divider);
      flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .logo-text {
      font-size: 1.35rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary) 0%, var(--lavender) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 2px;
      margin: 0;
      text-transform: uppercase;
      position: relative;
    }

    .logo-text::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--lavender));
      border-radius: 2px;
    }

    .main-content {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px;
      padding-bottom: 40px;
      color: var(--text);
      min-height: 0;
      background: var(--bg-soft);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: var(--lavender) transparent;
    }

    .main-content::-webkit-scrollbar {
      width: 5px;
    }

    .main-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .main-content::-webkit-scrollbar-thumb {
      background: var(--lavender);
      border-radius: 3px;
    }

    .welcome-card {
      background: #fff;
      border-radius: var(--radius-lg);
      padding: 40px 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
      text-align: center;
      border: 1px solid var(--divider);
    }

    .avatar-container {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--lavender);
      box-shadow: var(--shadow-lg);
      transition: transform 0.3s ease;
    }

    .avatar:hover {
      transform: scale(1.05);
    }

    .user-name {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 8px;
    }

    .user-email {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0 0 12px;
    }

    .user-badges {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 12px;
    }

    .badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .badge.verified {
      background: rgba(102, 103, 171, 0.1);
      color: var(--lavender);
      border: 1px solid var(--lavender);
    }

    .info-card {
      background: #fff;
      border-radius: var(--radius-lg);
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--divider);
    }

    .card-title {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0 0 24px;
      color: var(--text-secondary);
      letter-spacing: 1px;
      text-transform: uppercase;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--lavender);
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: var(--bg-soft);
      border-radius: var(--radius-md);
      border: 1px solid var(--divider);
      transition: all 0.2s ease;
      gap: 16px;
    }

    .info-item:hover {
      background: #fff;
      box-shadow: var(--shadow-sm);
      transform: translateX(4px);
    }

    .label {
      font-weight: 600;
      color: var(--text);
      font-size: 0.9rem;
      flex-shrink: 0;
      min-width: 120px;
    }

    .value {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-align: right;
      word-break: break-word;
      flex: 1;
    }

    .value.mono {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    button {
      padding: 14px 24px;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--lavender) 100%);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-logout {
      background: #fff;
      color: #dc2626;
      border: 2px solid #dc2626;
    }

    .btn-logout:hover {
      background: #dc2626;
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .state {
      color: var(--text-secondary);
      margin: 40px 0;
      padding: 30px;
      text-align: center;
      background: #fff;
      border-radius: var(--radius-lg);
      font-size: 0.95rem;
      border: 1px solid var(--divider);
      box-shadow: var(--shadow-sm);
    }

    .spacer {
      height: 24px;
    }

    @media (min-width: 768px) {
      .main-content {
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 24px;
      }

      .actions {
        flex-direction: row;
        justify-content: center;
      }

      button {
        flex: 1;
        max-width: 250px;
      }

      .info-item {
        padding: 16px 18px;
      }

      .label {
        min-width: 150px;
      }
    }

    @media (min-width: 1024px) {
      .main-content {
        max-width: 800px;
        padding: 48px 32px;
      }

      .welcome-card {
        padding: 50px 40px;
      }

      .info-card {
        padding: 40px;
      }

      .avatar {
        width: 140px;
        height: 140px;
      }
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

  goToProducts() {
    this.router.navigate(['/home']);
  }

  getFullName(user: any): string {
    if (user.given_name && user.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    return user.name || user.nickname || user.email?.split('@')[0] || 'Usuario';
  }

  getDefaultAvatar(user: any): string {
    const name = this.getFullName(user);
    const initial = name.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6667ab&color=fff&size=200&bold=true`;
  }

  onImageError(event: any, user: any) {
    event.target.src = this.getDefaultAvatar(user);
  }

  hasPersonalInfo(user: any): boolean {
    return !!(user.given_name || user.family_name || 
              user.gender || user.birthdate || user.phone_number || user.address);
  }

  hasMetadata(user: any): boolean {
    const excludedKeys = [
      'sub', 'name', 'given_name', 'family_name', 'nickname', 'email', 
      'email_verified', 'picture', 'updated_at', 'locale', 'zoneinfo',
      'gender', 'birthdate', 'phone_number', 'address', 'multifactor'
    ];
    return Object.keys(user).some(key => !excludedKeys.includes(key) && user[key]);
  }

  getMetadataKeys(user: any): string[] {
    const excludedKeys = [
      'sub', 'name', 'given_name', 'family_name', 'nickname', 'email', 
      'email_verified', 'picture', 'updated_at', 'locale', 'zoneinfo',
      'gender', 'birthdate', 'phone_number', 'address'
    ];
    return Object.keys(user).filter(key => !excludedKeys.includes(key) && user[key]);
  }

  getMetadataValue(user: any, key: string): string {
    const value = user[key];
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  formatAddress(address: any): string {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object') {
      const parts = [];
      if (address.street_address) parts.push(address.street_address);
      if (address.locality) parts.push(address.locality);
      if (address.region) parts.push(address.region);
      if (address.postal_code) parts.push(address.postal_code);
      if (address.country) parts.push(address.country);
      return parts.join(', ') || JSON.stringify(address);
    }
    return String(address);
  }

  getAuthProvider(sub: string | undefined): string {
    if (!sub) return '';
    
    if (sub.includes('auth0|')) return '🔑 Auth0 Database';
    if (sub.includes('google-oauth2|')) return '🔵 Google';
    if (sub.includes('facebook|')) return '🔷 Facebook';
    if (sub.includes('twitter|')) return '🐦 Twitter';
    if (sub.includes('github|')) return '⚫ GitHub';
    if (sub.includes('linkedin|')) return '💼 LinkedIn';
    if (sub.includes('microsoft|')) return '🪟 Microsoft';
    if (sub.includes('apple|')) return '🍎 Apple';
    
    const provider = sub.split('|')[0];
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}