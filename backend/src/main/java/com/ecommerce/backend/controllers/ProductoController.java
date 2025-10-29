package com.ecommerce.backend.controllers;

import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.services.ProductoServiceImplement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/producto")
public class ProductoController {

    @Autowired
    private ProductoServiceImplement productoServiceImplement;

    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> saveProducto(@RequestBody @Valid Producto producto, BindingResult br) {
        if (br.hasErrors()) {
            var errores = br.getFieldErrors().stream()
                    .map(e -> Map.of("field", e.getField(), "message", e.getDefaultMessage()))
                    .toList();
            return ResponseEntity.badRequest().body(errores);
        }
        var saved = productoServiceImplement.saveProducto(producto); 
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateProducto(@RequestBody @Valid Producto producto, BindingResult br) {
        if (br.hasErrors()) {
            var errores = br.getFieldErrors().stream()
                    .map(e -> Map.of("field", e.getField(), "message", e.getDefaultMessage()))
                    .toList();
            return ResponseEntity.badRequest().body(errores);
        }
        if (producto.getId() == null || productoServiceImplement.getProductoById(producto.getId()).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        var updated = productoServiceImplement.updateProducto(producto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Producto>> getAllProductos() {
        return ResponseEntity.ok(productoServiceImplement.getProductos());
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        Optional<Producto> producto = productoServiceImplement.getProductoById(id);
        return producto.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        Optional<Producto> producto = productoServiceImplement.getProductoById(id);
        if (producto.isPresent()) {
            productoServiceImplement.deleteProducto(producto.get().getId());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/_count")
    public long count() {
        return productoServiceImplement.getProductos().size();
    }
}
