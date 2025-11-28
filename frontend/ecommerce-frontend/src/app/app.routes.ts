import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { ProvisionGuard } from './guards/provision.guard';
import { EditarProductoComponent } from './pages/editar-producto/editar-producto';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/productos/productos').then((m) => m.Productos),
    canActivate: [AuthGuard, ProvisionGuard],
  },
  {
    path: 'createProduct',
    loadComponent: () => import('./pages/sell-products/sell-products').then((m) => m.SellProducts),
    canActivate: [AuthGuard],
  },

  {
    path: 'favoritos',
    loadComponent: () =>
      import('./pages/favoritos/favoritos.component').then((m) => m.FavoritosComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito/carrito.component').then((m) => m.CarritoComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle').then((m) => m.ProductoDetalleComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'editar-producto/:id',
    component: EditarProductoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./pages/callback/callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];