import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';
import { authConfig } from './auth.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    
    // 🔧 CAMBIO: Usar withInterceptors en lugar de withInterceptorsFromDi
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    
    provideAuth0(authConfig),
  ]
};