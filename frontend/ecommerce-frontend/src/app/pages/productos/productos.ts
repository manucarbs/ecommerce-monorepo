import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/productoService';
import { Producto } from '../../interface/IProducto';
import { ProductCardComponent } from "../../components/product-card/product-card";
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  auth = inject(AuthService);
  logoText = 'E-COMMERCE';
  searchPlaceholder = 'Buscar productos, marcas, categorías...';

  products          = signal<Producto[]>([]);      
  filteredProducts  = signal<Producto[]>([]);      
  categories        = signal<string[]>([]);        
  cargando          = signal<boolean>(false);
  errorMsg          = signal<string>('');
  activeTab         = signal<string>('home');

  // filtros
  selectedCategory  = signal<string | null>(null); // null => "Todas"
  searchTerm        = signal<string>('');         

  constructor(
    private readonly productoSrv: ProductoService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.errorMsg.set('');

    this.productoSrv.getProductos().subscribe({
      next: (data) => {
        const list = data ?? [];

       
        this.products.set(list);

        
        this.categories.set(this.buildCategories(list));

        
        this.selectedCategory.set(null); // "Todas"
        this.searchTerm.set('');

       
        this.applyFilters();

        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg.set('No se pudieron cargar los productos.');
        this.cargando.set(false);
      }
    });
  }

  
  private buildCategories(list: Producto[]): string[] {
    const map = new Map<string, string>(); 
    for (const p of list) {
      const raw = (p.categoria ?? '').toString().trim();
      if (!raw) continue;
      const k = this.normalize(raw);
      if (!map.has(k)) map.set(k, raw);
    }
    return [...map.values()].sort((a, b) =>
      this.normalize(a).localeCompare(this.normalize(b))
    );
  }

  private normalize(txt: string): string {
    return (txt || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }


  private applyFilters(): void {
    const allProducts     = this.products();
    const categoryFilter  = this.selectedCategory();
    const term            = this.searchTerm();

    let list = [...allProducts];

    // 1. Filtro por categoría (solo si no es null ni string vacío)
    if (categoryFilter !== null && categoryFilter !== '') {
      const normalizedCat = this.normalize(categoryFilter);
      list = list.filter(p => this.normalize(p.categoria) === normalizedCat);
    }

    // 2. Filtro por término de búsqueda (título / descripción / categoría)
    if (term && term.trim().length > 0) {
      const q = this.normalize(term);
      list = list.filter(p =>
        this.normalize(p.titulo).includes(q) ||
        this.normalize(p.descripcion).includes(q) ||
        this.normalize(p.categoria).includes(q)
      );
    }

 
    this.filteredProducts.set(list);
  }


  selectCategory(label: string | null) {
    this.selectedCategory.set(label); // null => Todas
    this.searchTerm.set('');          // limpiar búsqueda al cambiar categoría
    this.applyFilters();              // recalcular
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();              // recalcular
  }

 
  openProduct(p: Producto) {
    alert(`Detalle: ${p.titulo}`);
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  getImagen(p: Producto) {
    // se trabajara mas adelante para subir la imagen desde el equipo
    return `https://picsum.photos/seed/${p.id || p.titulo}/400/300`;
  }

  goToSell() {
    this.router.navigate(['/createProduct']);
  }
   logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }
}
