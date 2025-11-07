package com.ecommerce.backend.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.ProductoCreateDto;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.UsuarioRepository;
import com.ecommerce.backend.services.ProductoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/private/producto")
public class ProductoController {

    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository; // solo lectura para resolver dueño

    // ---------- READ ----------
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Producto>> getAllProductos() {
        return ResponseEntity.ok(productoService.getProductos());
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        Optional<Producto> producto = productoService.getProductoById(id);
        return producto
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /** Productos del usuario autenticado (sub → Usuario.id → FK) */
    @GetMapping("/mine")
    public ResponseEntity<?> getMyProducts(@AuthenticationPrincipal Jwt jwt) {
        String sub = jwt.getClaimAsString("sub");
        var userOpt = usuarioRepository.findByAuth0Sub(sub);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error", "USER_NOT_PROVISIONED",
                    "message", "Provisiona primero tu usuario."
                ));
        }
        return ResponseEntity.ok(productoService.findByOwnerId(userOpt.get().getId()));
    }

    // ---------- CREATE ----------
    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> saveProducto(@RequestBody @Valid ProductoCreateDto dto,
                                          BindingResult br,
                                          @AuthenticationPrincipal Jwt jwt) {
        if (br.hasErrors()) {
            var errores = br.getFieldErrors().stream()
                .map(e -> Map.of("field", e.getField(), "message", e.getDefaultMessage()))
                .toList();
            return ResponseEntity.badRequest().body(errores);
        }

        String sub = jwt.getClaimAsString("sub");
        var userOpt = usuarioRepository.findByAuth0Sub(sub);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error", "USER_NOT_PROVISIONED",
                    "message", "Provisiona primero tu usuario."
                ));
        }

        Usuario owner = userOpt.get();

        Producto p = new Producto();
        p.setTitulo(dto.getTitulo());
        p.setCategoria(dto.getCategoria());
        p.setEstado(dto.getEstado());
        p.setDescripcion(dto.getDescripcion());
        p.setPrecio(dto.getPrecio());
        p.setStock(dto.getStock() == null ? 1 : dto.getStock());
        p.setImagenUrl(dto.getImagenUrl());
        p.setOwner(owner);      
        p.setOwnerSub(sub);     

        var saved = productoService.saveProducto(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> updateProducto(@PathVariable Long id,
                                            @RequestBody @Valid ProductoCreateDto dto,
                                            BindingResult br,
                                            @AuthenticationPrincipal Jwt jwt) {
        if (br.hasErrors()) {
            var errores = br.getFieldErrors().stream()
                .map(e -> Map.of("field", e.getField(), "message", e.getDefaultMessage()))
                .toList();
            return ResponseEntity.badRequest().body(errores);
        }

        var existingOpt = productoService.getProductoById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String sub = jwt.getClaimAsString("sub");
        var userOpt = usuarioRepository.findByAuth0Sub(sub);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error", "USER_NOT_PROVISIONED",
                    "message", "Provisiona primero tu usuario."
                ));
        }

        var existing = existingOpt.get();
        // Solo el dueño puede actualizar
        if (!userOpt.get().getId().equals(existing.getOwner().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        existing.setTitulo(dto.getTitulo());
        existing.setCategoria(dto.getCategoria());
        existing.setEstado(dto.getEstado());
        existing.setDescripcion(dto.getDescripcion());
        existing.setPrecio(dto.getPrecio());
        existing.setStock(dto.getStock() == null ? 1 : dto.getStock());
        existing.setImagenUrl(dto.getImagenUrl());

        return ResponseEntity.ok(productoService.updateProducto(existing));
    }

    // ---------- DELETE ----------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProducto(@PathVariable Long id,
                                            @AuthenticationPrincipal Jwt jwt) {
        var existingOpt = productoService.getProductoById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String sub = jwt.getClaimAsString("sub");
        var userOpt = usuarioRepository.findByAuth0Sub(sub);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "error", "USER_NOT_PROVISIONED",
                    "message", "Provisiona primero tu usuario."
                ));
        }

        var existing = existingOpt.get();
        // Solo el dueño puede borrar
        if (!userOpt.get().getId().equals(existing.getOwner().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        productoService.deleteProducto(existing.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/_count")
    public long count() {
        return productoService.getProductos().size();
    }
}
