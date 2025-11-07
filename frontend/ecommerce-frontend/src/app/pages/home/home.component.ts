import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="app-screen">
      @if (!(auth.isAuthenticated$ | async)) {
        <div class="guest">
          <div class="logo-container">
            <div class="logo-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
          </div>
          <h1>Ecommerce</h1>
          <p>Descubre productos increíbles<br/>Inicia sesión para continuar</p>
          <button (click)="login()" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Iniciar Sesión con Auth0
          </button>
          <div class="decorative-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Paleta de Colores MOON */
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, #420D4B, #210635);
      position: relative;
      overflow: hidden;
    }

    :host::before {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(123, 51, 126, 0.3), transparent);
      border-radius: 50%;
      top: -100px;
      right: -100px;
      animation: float 6s ease-in-out infinite;
    }

    :host::after {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(102, 103, 171, 0.2), transparent);
      border-radius: 50%;
      bottom: -50px;
      left: -50px;
      animation: float 8s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(20px); }
    }

    .app-screen { 
      width: 100%; 
      max-width: 400px; 
      min-height: 100vh; 
      height: auto; 
      border: none; 
      border-radius: 0; 
      overflow: hidden; 
      position: relative; 
      margin: 0; 
      box-shadow: none; 
      background-color: transparent;
      display: flex; 
      flex-direction: column;
      justify-content: center;
      padding: 40px 20px;
      box-sizing: border-box;
      z-index: 1;
    }

    .authenticated,
    .guest {
      text-align: center;
      width: 100%;
      animation: fadeIn 0.6s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcome-header {
      margin-bottom: 30px;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #7B337E, #6667AB);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 20px rgba(123, 51, 126, 0.4);
      color: #F5D5E0;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .logo-container {
      margin-bottom: 30px;
    }

    .logo-circle {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(123, 51, 126, 0.3), rgba(102, 103, 171, 0.3));
      backdrop-filter: blur(10px);
      border: 2px solid rgba(123, 51, 126, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 8px 30px rgba(123, 51, 126, 0.3);
      color: #F5D5E0;
    }

    h1 {
      color: #F5D5E0;
      font-size: 32px;
      margin-bottom: 15px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .avatar-container {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 25px;
    }

    .avatar { 
      width: 100px; 
      height: 100px; 
      border-radius: 50%; 
      display: block;
      border: 3px solid #7B337E;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .status-dot {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 18px;
      height: 18px;
      background: #4ade80;
      border: 3px solid #210635;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(74, 222, 128, 0.5);
    }

    .user-info { 
      background: rgba(123, 51, 126, 0.15);
      backdrop-filter: blur(20px);
      padding: 30px 25px;
      border-radius: 20px;
      margin: 20px 0;
      border: 1px solid rgba(123, 51, 126, 0.3);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #F5D5E0;
      font-size: 15px;
      margin: 0;
      text-align: left;
      padding: 12px 15px;
      background: rgba(66, 13, 75, 0.3);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .detail-row:hover {
      background: rgba(66, 13, 75, 0.5);
      transform: translateX(5px);
    }

    .detail-row svg {
      color: #6667AB;
      flex-shrink: 0;
    }

    .detail-row strong {
      color: #6667AB;
      margin-right: 5px;
    }

    .guest p { 
      color: #F5D5E0; 
      margin-bottom: 35px;
      font-size: 16px;
      opacity: 0.9;
      line-height: 1.6;
    }

    .actions { 
      display: flex; 
      flex-direction: column;
      gap: 15px;
      margin-top: 35px;
      width: 100%;
    }

    button { 
      padding: 16px 24px;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      width: 100%;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      position: relative;
      overflow: hidden;
    }

    button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    button:hover::before {
      width: 300px;
      height: 300px;
    }

    button svg {
      position: relative;
      z-index: 1;
    }

    .btn-primary { 
      background: linear-gradient(135deg, #7B337E, #6667AB);
      color: #F5D5E0;
      box-shadow: 0 4px 15px rgba(123, 51, 126, 0.4);
    }

    .btn-primary:hover { 
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(123, 51, 126, 0.6);
    }

    .btn-primary:active {
      transform: translateY(-1px);
    }

    .btn-secondary { 
      background: rgba(66, 13, 75, 0.5);
      color: #F5D5E0;
      border: 2px solid rgba(123, 51, 126, 0.5);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover { 
      background: rgba(66, 13, 75, 0.7);
      border-color: #6667AB;
      transform: translateY(-2px);
    }

    .decorative-dots {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 40px;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: #6667AB;
      border-radius: 50%;
      animation: bounce 1.5s ease-in-out infinite;
      opacity: 0.6;
    }

    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Responsive */
    @media (max-width: 400px) {
      .app-screen {
        padding: 30px 15px;
      }

      h1 {
        font-size: 28px;
      }

      .avatar-container,
      .avatar {
        width: 80px;
        height: 80px;
      }

      .logo-circle {
        width: 80px;
        height: 80px;
      }

      .logo-circle svg {
        width: 36px;
        height: 36px;
      }

      button {
        padding: 14px 20px;
        font-size: 15px;
      }
    }
  `]
})
export class HomeComponent {
  auth = inject(AuthService);
  router = inject(Router);

  login() {
    console.debug('[HOME] login()');
    this.auth.loginWithRedirect({ appState: { target: '/home' } });
  }
  
  logout() {
    console.debug('[HOME] logout()');
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
  
  goToDashboard() {
    console.debug('[HOME] goToDashboard()');
    this.router.navigateByUrl('/dashboard');
  }
}