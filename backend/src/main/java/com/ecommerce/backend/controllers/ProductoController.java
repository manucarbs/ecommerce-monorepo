package com.ecommerce.backend.controllers;

import java.util.Map;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.ProductoConDetalleDto;
import com.ecommerce.backend.dto.ProductoCreateDto;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.UsuarioRepository;
import com.ecommerce.backend.services.ProductoService;
import com.ecommerce.backend.services.FileStorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/private/producto")
public class ProductoController {

    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository;
    private final FileStorageService fileStorageService;

    // ---------- READ ----------
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<Producto>> getAllProductos() {
        return ResponseEntity.ok(productoService.getProductos());
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<?> getProductoById(@PathVariable Long id) {
        Optional<ProductoConDetalleDto> producto = productoService.getProductoConDetalle(id); // 🔥 Usar el nuevo método
        return producto
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

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
        
        // 🆕 Soportar múltiples imágenes
        if (dto.getImagenesUrl() != null && !dto.getImagenesUrl().isEmpty()) {
            p.setImagenesUrl(dto.getImagenesUrl());
        } else if (dto.getImagenUrl() != null && !dto.getImagenUrl().isBlank()) {
            // Retrocompatibilidad: si envía imagenUrl (singular)
            p.getImagenesUrl().add(dto.getImagenUrl());
        }
        
        // 🔥 AGREGAR ESTA LÍNEA:
        p.setWhatsappContacto(dto.getWhatsappContacto());

        p.setOwner(owner);
        p.setOwnerSub(sub);

        var saved = productoService.saveProducto(p);
        log.info("✅ Producto creado con {} imágenes", saved.getImagenesUrl().size());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ---------- UPDATE ----------
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
        
        // 🆕 Actualizar imágenes
        if (dto.getImagenesUrl() != null && !dto.getImagenesUrl().isEmpty()) {
            existing.setImagenesUrl(dto.getImagenesUrl());
        } else if (dto.getImagenUrl() != null && !dto.getImagenUrl().isBlank()) {
            existing.getImagenesUrl().clear();
            existing.getImagenesUrl().add(dto.getImagenUrl());
        }
        // 🔥 AGREGAR ESTA LÍNEA:
        existing.setWhatsappContacto(dto.getWhatsappContacto());

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

        // 🆕 ELIMINAR IMÁGENES DE CLOUDINARY ANTES DE BORRAR EL PRODUCTO
        try {
            if (existing.getImagenesUrl() != null && !existing.getImagenesUrl().isEmpty()) {
                log.info("🗑️ Eliminando {} imágenes de Cloudinary", existing.getImagenesUrl().size());
                fileStorageService.deleteMultiple(existing.getImagenesUrl());
            }
        } catch (Exception e) {
            log.error("❌ Error al eliminar imágenes de Cloudinary", e);
            // Continuar con la eliminación del producto aunque falle la eliminación de imágenes
        }

        productoService.deleteProducto(existing.getId());
        log.info("✅ Producto eliminado: {}", existing.getTitulo());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/_count")
    public long count() {
        return productoService.getProductos().size();
    }
}