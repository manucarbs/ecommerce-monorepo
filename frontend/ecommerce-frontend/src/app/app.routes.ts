import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { ProvisionGuard } from './guards/provision.guard';
import { EditarProductoComponent } from './pages/editar-producto/editar-producto';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ConfirmacionComponent } from './pages/confirmacion/confirmacion.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './guards/admin.guard';

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
    path: 'misProductos',  // Cambié de misProductos a mis-productos (consistencia)
    loadComponent: () =>
      import('./pages/mis-productos/mis-productos.component').then((m) => m.MisProductosComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'create-product',  // Cambié de createProduct a create-product
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
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'confirmacion',
    component: ConfirmacionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin-dashboard',  // Nueva ruta para el panel del vendedor
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
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