package com.ecommerce.backend.services;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.repositories.ProductoRepository;

import lombok.RequiredArgsConstructor;

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

    @Override
    public void deleteProducto(Long id) {
        productoRepository.deleteById(id);
    }

    @Override
    public List<Producto> findByOwnerId(Long ownerId) {
        return productoRepository.findByOwner_Id(ownerId);
    }
}
