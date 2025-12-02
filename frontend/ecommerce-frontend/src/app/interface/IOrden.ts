// interface/IOrden.ts
export interface OrdenItem {
  id?: number;
  productoId: number;
  vendedorSub: string;
  nombre?: string;
  precioUnitario: number;
  cantidad: number;
  imagen?: string;
  producto?: {
    id: number;
    titulo: string;
    imagenPrincipal?: string;
    precio: number;
  };
}

export interface ClienteOrden {
  nombre: string;
  email: string;
  telefono: string;
  userId?: string;
}

export interface Orden {
  id: number;
  numeroOrden: string;
  compradorSub: string;
  items: OrdenItem[];
  
  // Información de envío
  direccionEnvio: string;
  ciudad: string;
  telefono: string;
  referencia?: string;
  
  // Información de pago
  estado: string; // 'PENDIENTE' | 'PAGADO' | 'CANCELADO'
  metodoPago?: string;
  idPagoStripe?: string;
  total: number;
  
  // Fechas
  creadoEn: Date;
  pagadoEn?: Date;
  
  // Información del comprador
  comprador?: {
    id?: number;
    nombre?: string;
    email?: string;
    auth0Sub?: string;
  };
  
  // Campos para compatibilidad con template (agregar estos)
  montoTotal?: number; // alias de total
  fechaCreacion?: Date; // alias de creadoEn
  cliente?: { nombre?: string }; // alias de comprador
  estadoPago?: string; // alias de estado
  estadoEnvio?: string; // campo temporal (si no existe en backend)
}

export interface EstadisticasVendedor {
  totalVentas: number;
  ordenesHoy: number;
  productosActivos: number;
  promedioVenta: number;
  ordenesPorEstado: {
    pendiente: number;
    pagado: number;
    cancelado: number;
  };
}