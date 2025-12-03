package com.ecommerce.backend.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.dto.ProductoConDetalleDto; // 🆕
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.ProductoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductoServiceImplement implements ProductoService {

    private final ProductoRepository productoRepository;

    @Override
    public Producto saveProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    public Producto updateProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    public List<Producto> getProductos() {
        return productoRepository.findAll();
    }

    @Override
    public Optional<Producto> getProductoById(Long id) {
        return productoRepository.findById(id);
    }
    
    // 🆕 NUEVO MÉTODO QUE INCLUYE INFO DEL OWNER
    @Override
    public Optional<ProductoConDetalleDto> getProductoConDetalle(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        
        if (productoOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Producto p = productoOpt.get();
        Usuario owner = p.getOwner(); // Esto carga el owner por el @ManyToOne
        
        ProductoConDetalleDto dto = new ProductoConDetalleDto();
        
        // Datos del producto
        dto.setId(p.getId());
        dto.setTitulo(p.getTitulo());
        dto.setCategoria(p.getCategoria());
        dto.setEstado(p.getEstado());
        dto.setDescripcion(p.getDescripcion());
        dto.setPrecio(p.getPrecio());
        dto.setStock(p.getStock());
        dto.setImagenesUrl(p.getImagenesUrl());
        dto.setImagenPrincipal(p.getImagenPrincipal());
        dto.setWhatsappContacto(p.getWhatsappContacto());
        dto.setOwnerId(p.getOwnerId());
        dto.setOwnerSub(p.getOwnerSub());
        dto.setCreadoEn(p.getCreadoEn());
        dto.setActualizadoEn(p.getActualizadoEn());
        
        // 🔥 MAPEAR INFO DEL OWNER
        if (owner != null) {
            ProductoConDetalleDto.OwnerInfo ownerInfo = new ProductoConDetalleDto.OwnerInfo();
            ownerInfo.setId(owner.getId());
            ownerInfo.setNombre(owner.getNombre());
            ownerInfo.setApellido(owner.getApellido());
            ownerInfo.setEmail(owner.getEmail());
            ownerInfo.setPictureUrl(owner.getPictureUrl());
            
            dto.setOwner(ownerInfo);
            
            log.info("✅ Owner mapeado: {} {}", owner.getNombre(), owner.getApellido());
        } else {
            log.warn("⚠️ Producto sin owner: {}", p.getId());
        }
        
        return Optional.of(dto);
    }

    @Override
    public void deleteProducto(Long id) {
        productoRepository.deleteById(id);
    }

    @Override
    public List<Producto> findByOwnerId(Long ownerId) {
        return productoRepository.findByOwner_Id(ownerId);
    }

    @Override
    @Transactional
    public Producto actualizarStock(Long productoId, Integer nuevoStock) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (nuevoStock < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        
        producto.setStock(nuevoStock);
        return productoRepository.save(producto);
    }

    @Override
    public boolean verificarStockDisponible(Long productoId, Integer cantidad) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        return producto.getStock() >= cantidad;
    }

    @Override
    @Transactional
    public Producto reducirStock(Long productoId, Integer cantidad) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad a reducir debe ser mayor a 0");
        }
        
        if (producto.getStock() < cantidad) {
            throw new IllegalArgumentException("Stock insuficiente. Stock disponible: " + producto.getStock());
        }
        
        producto.setStock(producto.getStock() - cantidad);
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto aumentarStock(Long productoId, Integer cantidad) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad a aumentar debe ser mayor a 0");
        }
        
        producto.setStock(producto.getStock() + cantidad);
        return productoRepository.save(producto);
    }
}