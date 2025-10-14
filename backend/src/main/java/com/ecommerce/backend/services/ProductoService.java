package com.ecommerce.backend.services;

import java.util.List;
import java.util.Optional;

import com.ecommerce.backend.entities.Producto;

public interface ProductoService {
    
    //Metodo para guardar un producto
    Producto saveProducto(Producto producto);

    //Metodo para actualizar un producto
    Producto updateProducto(Producto producto);

    //Metodo para obtener todos los productos
    List<Producto> getProductos();

    //Metodo para buscar un producto por medio del id
    Optional<Producto> getProductoById(Long id);

    //Metodo para eliminar un producto
    void deleteProducto(Long id);

}
