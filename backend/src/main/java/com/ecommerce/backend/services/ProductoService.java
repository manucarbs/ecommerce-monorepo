package com.ecommerce.backend.services;

import java.util.List;
import java.util.Optional;

import com.ecommerce.backend.entities.Producto;

public interface ProductoService {
    
    Producto saveProducto(Producto producto);

    Producto updateProducto(Producto producto);

    List<Producto> getProductos();

    Optional<Producto> getProductoById(Long id);

    void deleteProducto(Long id);

    List<Producto> findByOwnerId(Long ownerId); 
}
