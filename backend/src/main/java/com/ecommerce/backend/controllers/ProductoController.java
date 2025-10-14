package com.ecommerce.backend.controllers;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.services.ProductoServiceImplement;

@RestController
@RequestMapping("/producto")
public class ProductoController {
    
    @Autowired
    ProductoServiceImplement productoServiceImplement;

    @PostMapping
    public ResponseEntity<Producto> saveProducto(@RequestBody Producto producto){
        try {
            Producto saveProducto = productoServiceImplement.saveProducto(producto);
            return new ResponseEntity<>(saveProducto, HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping
    public ResponseEntity<Producto> updateProducto(@RequestBody Producto producto){
        try {
            if(producto.getId() == null || productoServiceImplement.getProductoById(producto.getId()).isEmpty()){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Producto saveProducto = productoServiceImplement.updateProducto(producto);
            return new ResponseEntity<>(saveProducto, HttpStatus.OK);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos() {
        return new ResponseEntity<>(productoServiceImplement.getProductos(),HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id){
        Optional<Producto> producto = productoServiceImplement.getProductoById(id);
        if (producto.isEmpty())
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(producto.get(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        Optional<Producto> producto = productoServiceImplement.getProductoById(id);
        if (producto.isPresent()){
            productoServiceImplement.deleteProducto(producto.get().getId());
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
