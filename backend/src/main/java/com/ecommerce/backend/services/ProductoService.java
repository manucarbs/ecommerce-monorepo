package com.ecommerce.backend.services;

import java.util.List;
import java.util.Optional;

import com.ecommerce.backend.dto.ProductoConDetalleDto; // 🆕
import com.ecommerce.backend.entities.Producto;

public interface ProductoService {
    
    Producto saveProducto(Producto producto);

    Producto updateProducto(Producto producto);

    List<Producto> getProductos();

    Optional<Producto> getProductoById(Long id);
    
    // 🆕 NUEVO MÉTODO
    Optional<ProductoConDetalleDto> getProductoConDetalle(Long id);

    void deleteProducto(Long id);

    List<Producto> findByOwnerId(Long ownerId); 

    Producto actualizarStock(Long productoId, Integer nuevoStock);
    
    boolean verificarStockDisponible(Long productoId, Integer cantidad);

    Producto reducirStock(Long productoId, Integer cantidad);

    Producto aumentarStock(Long productoId, Integer cantidad);
}