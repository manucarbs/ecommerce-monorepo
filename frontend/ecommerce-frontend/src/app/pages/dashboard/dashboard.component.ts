import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe],
  template: `
    <div class="app-screen">
      <!-- Header -->
      <header class="top-header">
        <button class="btn-back" (click)="goToProducts()">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Volver
        </button>

        <h1 class="logo-text">
          <svg
            class="logo-icon"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="url(#gradient)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
              stroke="url(#gradient)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3B82F6" />
                <stop offset="100%" stop-color="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          PERFIL
        </h1>
      </header>

      <!-- Contenido principal desplazable -->
      <main class="main-content">
        <div *ngIf="auth.user$ | async as user; else loading">
          <!-- Tarjeta de Bienvenida -->
          <section class="profile-section">
            <div class="welcome-card">
              <div class="avatar-container">
                <img
                  [src]="user.picture || getDefaultAvatar(user)"
                  [alt]="user.name || 'Usuario'"
                  class="avatar"
                  (error)="onImageError($event, user)"
                />
              </div>
              <div class="user-info">
                <h2 class="user-name">{{ getFullName(user) }}</h2>
                <p class="user-email">{{ user.email }}</p>
                <div class="user-badges" *ngIf="user.email_verified">
                  <span class="badge verified">✓ Verificado</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Información Personal -->
          <section class="profile-section" *ngIf="hasPersonalInfo(user)">
            <h2 class="section-title">👤 Información Personal</h2>
            <div class="info-card">
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
                  <span class="value">{{ user.birthdate | date : 'dd/MM/yyyy' }}</span>
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
            </div>
          </section>

          <!-- Información de la Cuenta -->
          <section class="profile-section">
            <h2 class="section-title">🔐 Información de la Cuenta</h2>
            <div class="info-card">
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
                  <span class="value">{{ user.updated_at | date : 'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Metadata adicional (si existe) -->
          <section class="profile-section" *ngIf="hasMetadata(user)">
            <h2 class="section-title">📊 Información Adicional</h2>
            <div class="info-card">
              <div class="info-grid">
                <div class="info-item" *ngFor="let key of getMetadataKeys(user)">
                  <span class="label">{{ formatKey(key) }}</span>
                  <span class="value">{{ getMetadataValue(user, key) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Botones de acción -->
          <div class="actions-section">
            <button (click)="goToProducts()" class="btn-primary">🏠 Volver a Productos</button>
            <button (click)="logout()" class="btn-logout">🚪 Cerrar Sesión</button>
          </div>
        </div>

        <ng-template #loading>
          <div class="state" role="status" aria-live="polite">
            <div class="loading-spinner"></div>
            <span>Cargando información del perfil...</span>
          </div>
        </ng-template>

        <!-- Espaciador para scroll -->
        <div class="spacer"></div>
      </main>
    </div>
  `,
  styles: [
    `
  /* ==================== VARIABLES MODERNAS ==================== */
  :host {
    --bg: #f8fafc;
    --bg-soft: #f1f5f9;
    --bg-card: #ffffff;
    --text: #1e293b;
    --text-secondary: #64748b;
    --muted: #94a3b8;
    --primary: #3b82f6;
    --primary-light: #60a5fa;
    --primary-dark: #2563eb;
    --accent: #8b5cf6;
    --divider: #e2e8f0;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    
    display: block;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
  }

  /* ==================== LAYOUT PRINCIPAL ==================== */
  .app-screen {
    background: var(--bg);
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow: hidden;
    position: relative;
  }

  /* ==================== HEADER MODIFICADO ==================== */
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--divider);
    flex-shrink: 0;
    flex-grow: 0;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
    position: relative;
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
  }

  .btn-back:hover {
    background: var(--bg-soft);
    color: var(--primary);
  }

  .btn-back svg {
    width: 18px;
    height: 18px;
  }

  .logo-text {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.4rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 1.5px;
    margin: 0;
    text-transform: uppercase;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .logo-icon {
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }

  /* ==================== CONTENIDO PRINCIPAL ==================== */
  .main-content {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
    padding-bottom: 24px;
    color: var(--text);
    min-height: 0;
    background: transparent;
    -webkit-overflow-scrolling: touch;
  } /* ← LLAVE CERRADA CORRECTAMENTE */

  /* ==================== SECCIONES ==================== */
  .profile-section {
    margin-bottom: 24px;
    width: 100%;
  }

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--text);
  letter-spacing: -0.2px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto; 
  padding: 0 24px;
}

  /* ==================== TARJETA DE BIENVENIDA MEJORADA ==================== */
  .welcome-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 32px;
    border: 1px solid var(--divider);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 24px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .welcome-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .avatar-container {
    flex-shrink: 0;
  }

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-light);
}

  .avatar:hover {
    transform: scale(1.05);
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 8px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0 0 16px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-badges {
    display: flex;
    gap: 8px;
  }

  .badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .badge.verified {
    background: rgba(59, 130, 246, 0.1);
    color: var(--primary);
    border: 1px solid var(--primary);
  }

  /* ==================== TARJETAS DE INFORMACIÓN ==================== */
  .info-card {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    padding: 24px;
    border: 1px solid var(--divider);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .info-card:hover {
    box-shadow: var(--shadow-md);
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    background: var(--bg-soft);
    border-radius: var(--radius-sm);
    border: 1px solid var(--divider);
    transition: all 0.2s ease;
    gap: 16px;
  }

  .info-item:hover {
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    transform: translateX(4px);
  }

  .label {
    font-weight: 600;
    color: var(--text);
    font-size: 0.9rem;
    flex-shrink: 0;
    min-width: 140px;
  }

  .value {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-align: right;
    word-break: break-word;
    flex: 1;
    line-height: 1.4;
  }

  .value.mono {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.02);
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--divider);
  }

  /* ==================== BOTONES DE ACCIÓN ==================== */
  .actions-section {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .btn-primary, .btn-logout {
    padding: 16px 24px;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: var(--shadow-sm);
    flex: 1;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .btn-logout {
    background: transparent;
    color: #dc2626;
    border: 2px solid #dc2626;
  }

  .btn-logout:hover {
    background: #dc2626;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  /* ==================== ESTADOS ==================== */
  .state {
    color: var(--text-secondary);
    margin: 40px 0;
    padding: 40px 20px;
    text-align: center;
    background: var(--bg-card);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    border: 1px solid var(--divider);
    font-weight: 500;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--divider);
    border-top: 2px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .spacer {
    height: 20px;
  }

  /* ==================== MEDIA QUERIES MEJORADAS ==================== */

  /* Tablets */
  @media (min-width: 768px) {
    .section-title {
      max-width: 700px;
      padding: 0 32px;
    }

    .top-header {
      padding: 18px 32px;
    }

    .logo-text {
      font-size: 1.5rem;
    }

    .welcome-card {
      padding: 40px;
      max-width: 700px;
    }

    .avatar {
      width: 120px;
      height: 120px;
    }

    .user-name {
      font-size: 1.8rem;
    }

    .info-card {
      padding: 32px;
      max-width: 700px;
    }

    .info-item {
      padding: 18px 20px;
    }

    .label {
      min-width: 160px;
    }

    .actions-section {
      gap: 20px;
      max-width: 700px;
    }

    .btn-primary, .btn-logout {
      padding: 18px 28px;
      font-size: 1rem;
    }
  }

  /* Desktop */
  @media (min-width: 1024px) {
    .section-title {
      max-width: 800px;
      padding: 0 40px;
    }

    .top-header {
      padding: 20px 40px;
    }

    .welcome-card {
      padding: 48px;
      max-width: 800px;
    }

    .avatar {
      width: 140px;
      height: 140px;
    }

    .user-name {
      font-size: 2rem;
    }

    .user-email {
      font-size: 1.1rem;
    }

    .info-card {
      padding: 40px;
      max-width: 800px;
    }

    .label {
      min-width: 180px;
    }

    .actions-section {
      max-width: 800px;
    }
  }

  /* Mobile pequeño - Layout vertical para la tarjeta de bienvenida */
  @media (max-width: 767px) {
    .section-title {
      max-width: 100%;
      padding: 0 20px;
    }

    .top-header {
      padding: 14px 20px;
    }

    .logo-text {
      font-size: 1.2rem;
    }

    .btn-back {
      font-size: 0.8rem;
      padding: 6px 10px;
    }

    .btn-back svg {
      width: 16px;
      height: 16px;
    }

    .welcome-card {
      flex-direction: column;
      text-align: center;
      padding: 24px;
      gap: 20px;
      max-width: 100%;
    }

    .avatar {
      width: 80px;
      height: 80px;
    }

    .user-name {
      font-size: 1.3rem;
    }

    .info-card {
      padding: 20px;
      max-width: 100%;
    }

    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .label {
      min-width: auto;
    }

    .value {
      text-align: left;
      width: 100%;
    }

    .actions-section {
      flex-direction: column;
      gap: 12px;
      max-width: 100%;
    }

    .btn-primary, .btn-logout {
      width: 100%;
    }
  }

  /* Mobile muy pequeño */
  @media (max-width: 375px) {
    .main-content {
      padding: 16px;
      padding-bottom: 16px;
    }

    .top-header {
      padding: 12px 16px;
    }

    .welcome-card {
      padding: 20px;
    }

    .info-card {
      padding: 16px;
    }

    .info-item {
      padding: 12px;
    }
  }
  `,
  ],
})
export class DashboardComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.auth.logout({
      logoutParams: { returnTo: window.location.origin },
    });
  }

  goToProducts(): void {
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initial
    )}&background=6667ab&color=fff&size=200&bold=true`;
  }

  onImageError(event: any, user: any): void {
    event.target.src = this.getDefaultAvatar(user);
  }

  hasPersonalInfo(user: any): boolean {
    return !!(
      user.given_name ||
      user.family_name ||
      user.gender ||
      user.birthdate ||
      user.phone_number ||
      user.address
    );
  }

  hasMetadata(user: any): boolean {
    const excludedKeys = [
      'sub',
      'name',
      'given_name',
      'family_name',
      'nickname',
      'email',
      'email_verified',
      'picture',
      'updated_at',
      'locale',
      'zoneinfo',
      'gender',
      'birthdate',
      'phone_number',
      'address',
      'multifactor',
    ];
    return Object.keys(user).some((key) => !excludedKeys.includes(key) && user[key]);
  }

  getMetadataKeys(user: any): string[] {
    const excludedKeys = [
      'sub',
      'name',
      'given_name',
      'family_name',
      'nickname',
      'email',
      'email_verified',
      'picture',
      'updated_at',
      'locale',
      'zoneinfo',
      'gender',
      'birthdate',
      'phone_number',
      'address',
    ];
    return Object.keys(user).filter((key) => !excludedKeys.includes(key) && user[key]);
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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