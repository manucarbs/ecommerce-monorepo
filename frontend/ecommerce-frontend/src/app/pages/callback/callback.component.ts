import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="spinner"></div>
      <h2>Procesando autenticación...</h2>
      <p>Serás redirigido en un momento</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #0066cc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    h2 {
      color: #333;
      margin: 10px 0;
    }

    p {
      color: #666;
    }
  `]
})
export class CallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Auth0 maneja automáticamente el callback
    // Redirigir al home después de un momento
    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    });
  }
}