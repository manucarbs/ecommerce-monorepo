export interface Producto {
  id: number;
  titulo: string;
  categoria: string;
  estado: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string;              // Campo antiguo (opcional)
  imagenesUrl: string[];           // 🆕 Múltiples imágenes
  imagenPrincipal?: string;        // 🆕 Primera imagen
  ownerId: number;
  ownerSub: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ProductoCreate {
  titulo: string;
  categoria: string;
  estado: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenesUrl: string[];           // 🆕 Múltiples imágenes
}

// 🆕 DTO extendido con información del dueño (para vista detallada)
export interface ProductoDetalle extends Producto {
  owner?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    pictureUrl: string;
  };
}