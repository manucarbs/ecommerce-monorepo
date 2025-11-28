import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { FavoritosService } from '../../services/favoritos.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductoconDetalle, OwnerInfo } from '../../interface/IProducto';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detalle.html',
  styleUrls: ['./producto-detalle.css'],
})
export class ProductoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoSrv = inject(ProductoService);
  private favoritosSrv = inject(FavoritosService);
  private carritoSrv = inject(CarritoService);
  public auth = inject(AuthService);

  // Estado
  producto = signal<ProductoconDetalle | null>(null);
  cargando = signal<boolean>(true);
  errorMsg = signal<string>('');

  // Galería de imágenes
  imagenActual = signal<number>(0);
  mostrarGaleria = signal<boolean>(false);

  // Usuario actual
  currentUserSub = signal<string | null>(null);

  // Acciones
  eliminando = signal<boolean>(false);
  
  // Favoritos
  toggleandoFavorito = signal<boolean>(false);

  // Carrito
  agregandoAlCarrito = signal<boolean>(false);
  cantidadCarrito = signal<number>(1);
  
  // Computed
  esFavorito = computed(() => {
    const p = this.producto();
    return p ? this.favoritosSrv.esFavorito(p.id) : false;
  });

  estaEnCarrito = computed(() => {
    const p = this.producto();
    return p ? this.carritoSrv.estaEnCarrito(p.id) : false;
  });

  // Computed para info del vendedor
  infoVendedor = computed(() => {
    const p = this.producto();
    
    console.log('🔍 DEBUG infoVendedor - Producto completo:', p);
    console.log('🔍 DEBUG infoVendedor - Owner:', p?.owner);
    console.log('🔍 DEBUG infoVendedor - WhatsApp:', p?.whatsappContacto);
    console.log('🔍 DEBUG esElDueno():', this.esElDueno());
    console.log('🔍 DEBUG currentUserSub:', this.currentUserSub());
    console.log('🔍 DEBUG producto.ownerSub:', p?.ownerSub);
    
    if (!p) {
      console.warn('⚠️ No hay producto cargado');
      return null;
    }
    
    if (!p.owner) {
      console.error('❌ El producto NO tiene información del owner. El backend no está devolviendo owner.');
      return null;
    }
    
    const nombreCompleto = `${p.owner.nombre} ${p.owner.apellido}`.trim();
    
    const vendedorInfo = {
      nombre: nombreCompleto || 'Vendedor',
      avatar: p.owner.pictureUrl || 'https://via.placeholder.com/80x80?text=👤',
      whatsappContacto: p.whatsappContacto,
      tieneWhatsApp: !!p.whatsappContacto && p.whatsappContacto.length > 5
    };
    
    console.log('✅ Info vendedor procesada:', vendedorInfo);
    console.log('🚀 ¿Debería mostrar sección vendedor?', !this.esElDueno());
    return vendedorInfo;
  });

  // Computed para verificar si es el dueño
  esElDueno = computed(() => {
    const p = this.producto();
    const currentSub = this.currentUserSub();
    return p !== null && currentSub !== null && p.ownerSub === currentSub;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg.set('ID de producto no válido');
      this.cargando.set(false);
      return;
    }

    this.auth.user$.subscribe((user) => {
      if (user?.sub) {
        this.currentUserSub.set(user.sub);
        this.favoritosSrv.cargarIdsFavoritos().subscribe();
        this.carritoSrv.cargarIdsCarrito().subscribe();
      }
    });

    this.cargarProducto(Number(id));
  }

  cargarProducto(id: number): void {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.productoSrv.getById(id).subscribe({
      next: (producto: ProductoconDetalle) => {
        this.producto.set(producto);
        this.cargando.set(false);
        
        // Debug: Verificar datos recibidos
        console.log('✅ Producto cargado:', producto.titulo);
        console.log('👤 Owner:', producto.owner ? `${producto.owner.nombre} ${producto.owner.apellido}` : 'Sin owner');
        console.log('📱 WhatsApp:', producto.whatsappContacto || 'No configurado');
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.errorMsg.set('No se pudo cargar el producto');
        this.cargando.set(false);
      },
    });
  }

  // ========== GALERÍA ==========

  get imagenes(): string[] {
    const p = this.producto();
    if (!p) return [];

    if (p.imagenesUrl && p.imagenesUrl.length > 0) {
      return p.imagenesUrl;
    }

    if (p.imagenUrl) {
      return [p.imagenUrl];
    }

    return [`https://via.placeholder.com/800x600?text=${encodeURIComponent(p.titulo)}`];
  }

  seleccionarImagen(index: number): void {
    this.imagenActual.set(index);
  }

  abrirGaleria(index: number): void {
    this.imagenActual.set(index);
    this.mostrarGaleria.set(true);
  }

  cerrarGaleria(): void {
    this.mostrarGaleria.set(false);
  }

  imagenAnterior(event: Event): void {
    event.stopPropagation();
    const imgs = this.imagenes;
    const actual = this.imagenActual();
    this.imagenActual.set(actual > 0 ? actual - 1 : imgs.length - 1);
  }

  imagenSiguiente(event: Event): void {
    event.stopPropagation();
    const imgs = this.imagenes;
    const actual = this.imagenActual();
    this.imagenActual.set(actual < imgs.length - 1 ? actual + 1 : 0);
  }

  // ========== FAVORITOS ==========

  toggleFavorito(): void {
    const p = this.producto();
    if (!p) return;

    this.toggleandoFavorito.set(true);

    this.favoritosSrv.toggle(p.id).subscribe({
      next: () => {
        this.toggleandoFavorito.set(false);
      },
      error: (err) => {
        console.error('Error al toggle favorito:', err);
        alert('❌ Error al actualizar favoritos');
        this.toggleandoFavorito.set(false);
      }
    });
  }

  // ========== CARRITO ==========
  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p) return;

    // Validar stock
    if (p.stock < this.cantidadCarrito()) {
      alert(`❌ Stock insuficiente. Solo quedan ${p.stock} unidades disponibles.`);
      return;
    }

    this.agregandoAlCarrito.set(true);

    this.carritoSrv.agregar(p.id, this.cantidadCarrito()).subscribe({
      next: () => {
        this.agregandoAlCarrito.set(false);
        alert(`✅ "${p.titulo}" agregado al carrito`);
      },
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        alert('❌ Error al agregar producto al carrito');
        this.agregandoAlCarrito.set(false);
      }
    });
  }

  eliminarDelCarrito(): void {
    const p = this.producto();
    if (!p) return;

    this.agregandoAlCarrito.set(true);

    this.carritoSrv.eliminar(p.id).subscribe({
      next: () => {
        this.agregandoAlCarrito.set(false);
        this.cantidadCarrito.set(1);
        alert(`✅ "${p.titulo}" eliminado del carrito`);
      },
      error: (err) => {
        console.error('Error al eliminar del carrito:', err);
        alert('❌ Error al eliminar producto del carrito');
        this.agregandoAlCarrito.set(false);
      }
    });
  }

  aumentarCantidad(): void {
    const p = this.producto();
    const cantidadActual = this.cantidadCarrito();
    
    if (p && cantidadActual < p.stock) {
      this.cantidadCarrito.set(cantidadActual + 1);
    }
  }

  disminuirCantidad(): void {
    const cantidadActual = this.cantidadCarrito();
    if (cantidadActual > 1) {
      this.cantidadCarrito.set(cantidadActual - 1);
    }
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  // ========== WHATSAPP ==========
  contactarVendedor(): void {
    const vendedor = this.infoVendedor();
    const producto = this.producto();
    
    if (!vendedor || !producto) {
      console.error('No hay información del vendedor o producto');
      return;
    }

    // Si NO tiene WhatsApp, mostrar alerta
    if (!vendedor.tieneWhatsApp) {
      alert('❌ Este vendedor no ha proporcionado un número de WhatsApp para contactar.');
      return;
    }

    // Mensaje predefinido con información del producto
    const mensaje = `¡Hola ${vendedor.nombre}! 👋\n\nMe interesa tu producto:\n\n📦 *${producto.titulo}*\n💰 Precio: ${this.formatearPrecio(producto.precio)}\n📝 Estado: ${producto.estado === 'nuevo' ? 'Nuevo ✨' : 'Usado 🔄'}\n\n¿Todavía está disponible? 🎯`;
    
    // Formatear número (remover espacios, guiones, etc.)
    const numeroWhatsApp = this.formatearNumeroWhatsApp(vendedor.whatsappContacto!);
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Redirigir automáticamente
    window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
  }

  private formatearNumeroWhatsApp(numero: string): string {
    // Remover todo excepto números y el signo +
    return numero.replace(/[^\d+]/g, '');
  }

  // ========== ACCIONES ==========

  editarProducto(): void {
    const p = this.producto();
    if (!p) return;
    this.router.navigate(['/editar-producto', p.id]);
  }

eliminarProducto(): void {
  const p = this.producto();
  if (!p) return;

  const confirmacion = confirm(
    `¿Estás seguro de eliminar "${p.titulo}"?\n\n` +
      `Las ${this.imagenes.length} imagen(es) también se eliminarán de Cloudinary.\n\n` +
      `Esta acción no se puede deshacer.`
  );

  if (!confirmacion) return;

  this.eliminando.set(true);

  this.productoSrv.delete(p.id).subscribe({
    next: () => {
      console.log('✅ Producto eliminado exitosamente');
      alert('✅ Producto e imágenes eliminados exitosamente');
      this.router.navigate(['/home']);
    },
    error: (err) => {
      console.error('❌ Error al eliminar:', err);
      
      // Manejo específico de errores
      if (err.status === 500) {
        console.error('Error 500 del servidor:', err);
        alert('❌ Error del servidor. El producto podría estar asociado a órdenes o favoritos.');
      } else if (err.status === 404) {
        alert('❌ Producto no encontrado.');
      } else if (err.status === 403) {
        alert('❌ No tienes permisos para eliminar este producto.');
      } else {
        alert('❌ Error inesperado al eliminar el producto.');
      }
      
      this.eliminando.set(false);
    },
    complete: () => {
      this.eliminando.set(false);
    }
  });
}

  volver(): void {
    this.router.navigate(['/home']);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}