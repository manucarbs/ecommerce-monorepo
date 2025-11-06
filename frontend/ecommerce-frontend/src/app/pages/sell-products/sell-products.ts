import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto, ProductoCreate } from '../../interface/IProducto';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sell-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell-products.html',
  styleUrls: ['./sell-products.css']
})
export class SellProducts implements OnInit {

  // UI
  logoText = 'E-COMMERCE';
  enviando = false;
  errorMsg = '';
  okMsg = '';

  // Datos dinámicos
  categorias = signal<string[]>([]);
  readonly OTRA = '__nueva__';

  form!: FormGroup; 


  mostrarNuevaCategoria = signal<boolean>(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly productoSrv: ProductoService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
   
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      descripcion: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(2000)]],
      categoria: ['', [Validators.required]],
      nuevaCategoria: [''],
      estado: ['nuevo', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      stock: [1, [Validators.min(0)]],
      imagenUrl: ['', [
        Validators.pattern(/^$|^(https?:\/\/)[\w\-._~:/?#[\]@!$&'()*+,;=%]+$/i)
      ]]
    });

   
    this.productoSrv.getAll().subscribe({
      next: (list) => {
        const uniq = this.buildCategories(list);
        this.categorias.set(uniq);
      },
      error: (e) => console.error(e)
    });

    
    this.form.get('categoria')?.valueChanges.subscribe(val => {
      const nc = this.form.get('nuevaCategoria');
      if (val === this.OTRA) {
        this.mostrarNuevaCategoria.set(true);
        nc?.addValidators([Validators.required, Validators.minLength(3), Validators.maxLength(60)]);
      } else {
        nc?.clearValidators();
        nc?.setValue('');
      }
      nc?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private normalize(txt: string): string {
    return (txt || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  private buildCategories(list: Producto[]): string[] {
    const map = new Map<string, string>();
    for (const p of list) {
      const raw = (p.categoria ?? '').toString().trim();
      if (!raw) continue;
      const k = this.normalize(raw);
      if (!map.has(k)) map.set(k, raw);
    }
    return [...map.values()].sort((a, b) => this.normalize(a).localeCompare(this.normalize(b)));
  }

  get f() { return this.form.controls; }

  getCategoriaFinal(): string {
    const cat = this.form.value.categoria;
    return cat === this.OTRA ? (this.form.value.nuevaCategoria || '').trim() : cat;
  }

  get previewImagen(): string | null {
    const url = (this.form.value.imagenUrl || '').trim();
    return url ? url : null;
  }

  onSubmit(): void {
    this.errorMsg = '';
    this.okMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ProductoCreate = {
      titulo: (this.form.value.titulo || '').toString().trim(),
      categoria: this.getCategoriaFinal(),
      estado: (this.form.value.estado || '').toString(),
      descripcion: (this.form.value.descripcion ?? '').toString(),
      precio: Number(this.form.value.precio),
      stock: Number(this.form.value.stock ?? 1),
      imagenUrl: (this.form.value.imagenUrl ?? '').toString()
    };

    this.enviando = true;
    this.productoSrv.create(payload).subscribe({
      next: () => {
        this.okMsg = 'Producto creado con éxito.';
        this.enviando = false;
        
        this.form.reset({
          titulo: '',
          descripcion: '',
          categoria: '',
          nuevaCategoria: '',
          estado: 'nuevo',
          precio: null,
          stock: 1,
          imagenUrl: ''
        });
        
        this.productoSrv.getAll().subscribe({
          next: (list) => this.categorias.set(this.buildCategories(list)),
          error: () => {}
        });
      },
      error: (e: any) => {
        console.error(e);
        this.errorMsg = 'No se pudo crear el producto.';
        this.enviando = false;
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
