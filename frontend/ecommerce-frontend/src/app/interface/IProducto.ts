export interface Producto {
  id: number;
  titulo: string;
  categoria: string;
  estado: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  imagenesUrl: string[];
  imagenPrincipal?: string;
  ownerId: number;
  ownerSub: string;
  creadoEn: string;
  actualizadoEn: string;
  whatsappContacto?: string;
}

export interface ProductoCreate {
  titulo: string;
  categoria: string;
  estado: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenesUrl: string[];
  whatsappContacto?: string;
}

// 🆕 INTERFAZ PARA EL OWNER
export interface OwnerInfo {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  pictureUrl: string;
}

// DTO extendido con información del dueño
export interface ProductoconDetalle extends Producto {
  owner: OwnerInfo; // 🆕 CORREGIDO: propiedad owner agregada
}