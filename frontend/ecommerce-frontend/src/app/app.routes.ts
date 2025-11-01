import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/productos/productos').then(m => m.Productos),
    canActivate: [AuthGuard]
  },
  {
    path: 'createProduct',
    loadComponent: () => import('./pages/sell-products/sell-products').then(m => m.SellProducts),
  },
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.component').then(m => m.CallbackComponent)
  },
  {path: '**',
    redirectTo: 'home'
  }
];