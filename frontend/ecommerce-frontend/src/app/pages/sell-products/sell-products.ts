import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto, ProductoCreate } from '../../interface/IProducto';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  subiendoImagenes = false;
  progresoUpload = signal<string>('');

  // Datos dinámicos
  categorias = signal<string[]>([]);
  readonly OTRA = '__nueva__';

  form!: FormGroup;
  mostrarNuevaCategoria = signal<boolean>(false);

  // 🆕 Manejo de imágenes
  selectedFiles = signal<File[]>([]);
  previewUrls = signal<string[]>([]);

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
      stock: [1, [Validators.min(0)]]
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

  // 🆕 Manejo de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // Validar máximo 5 imágenes
    if (files.length > 5) {
      this.errorMsg = '⚠️ Máximo 5 imágenes por producto';
      return;
    }

    // Validar tipo y tamaño
    const validFiles: File[] = [];
    for (const file of files) {
      // Validar tipo
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        this.errorMsg = `❌ ${file.name}: Solo JPG y PNG`;
        continue;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = `❌ ${file.name}: Máximo 5MB`;
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    this.selectedFiles.set(validFiles);

    // Generar previews
    const previews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        this.previewUrls.set([...previews]);
      };
      reader.readAsDataURL(file);
    });

    this.errorMsg = '';
  }

  // 🆕 Eliminar preview
  removePreview(index: number): void {
    const files = [...this.selectedFiles()];
    const previews = [...this.previewUrls()];
    
    files.splice(index, 1);
    previews.splice(index, 1);
    
    this.selectedFiles.set(files);
    this.previewUrls.set(previews);
  }

  onSubmit(): void {
    this.errorMsg = '';
    this.okMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validar que haya al menos una imagen
    if (this.selectedFiles().length === 0) {
      this.errorMsg = '⚠️ Debes agregar al menos una imagen';
      return;
    }

    this.enviando = true;
    this.subiendoImagenes = true;
    this.progresoUpload.set('📤 Subiendo imágenes a Cloudinary...');

    // Paso 1: Subir todas las imágenes a Cloudinary
    const uploadObservables = this.selectedFiles().map(file => 
      this.productoSrv.uploadImage(file).pipe(
        catchError(err => {
          console.error('Error al subir imagen:', err);
          return of(null);
        })
      )
    );

    forkJoin(uploadObservables).subscribe({
      next: (results) => {
        const validResults = results.filter(r => r !== null);
        
        if (validResults.length === 0) {
          this.errorMsg = '❌ No se pudo subir ninguna imagen';
          this.enviando = false;
          this.subiendoImagenes = false;
          this.progresoUpload.set('');
          return;
        }

        const urls = validResults.map(r => r!.url);
        this.subiendoImagenes = false;
        this.progresoUpload.set('💾 Guardando producto...');

        // Paso 2: Crear producto con las URLs de Cloudinary
        const payload: ProductoCreate = {
          titulo: (this.form.value.titulo || '').toString().trim(),
          categoria: this.getCategoriaFinal(),
          estado: (this.form.value.estado || '').toString(),
          descripcion: (this.form.value.descripcion ?? '').toString(),
          precio: Number(this.form.value.precio),
          stock: Number(this.form.value.stock ?? 1),
          imagenesUrl: urls
        };

        this.productoSrv.create(payload).subscribe({
          next: () => {
            this.okMsg = '✅ Producto creado con éxito';
            this.enviando = false;
            this.progresoUpload.set('');

            // Reset completo
            this.form.reset({
              titulo: '',
              descripcion: '',
              categoria: '',
              nuevaCategoria: '',
              estado: 'nuevo',
              precio: null,
              stock: 1
            });

            this.selectedFiles.set([]);
            this.previewUrls.set([]);

            // Recargar categorías
            this.productoSrv.getAll().subscribe({
              next: (list) => this.categorias.set(this.buildCategories(list)),
              error: () => {}
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
              this.router.navigate(['/productos']);
            }, 2000);
          },
          error: (e: any) => {
            console.error(e);
            this.errorMsg = '❌ No se pudo crear el producto';
            this.enviando = false;
            this.progresoUpload.set('');
          }
        });
      },
      error: (e: any) => {
        console.error(e);
        this.errorMsg = '❌ Error al subir imágenes';
        this.enviando = false;
        this.subiendoImagenes = false;
        this.progresoUpload.set('');
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}