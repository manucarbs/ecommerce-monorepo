package com.ecommerce.backend.repositories;

import com.ecommerce.backend.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // Método existente
    List<Producto> findByOwner_Id(Long ownerId);
    
    // ✅ AGREGAR ESTOS MÉTODOS NUEVOS:
    
    // 1. Buscar productos por ownerSub (string)
    List<Producto> findByOwnerSub(String ownerSub);
    
    // 2. Buscar productos activos con stock > 0 por ownerSub
    @Query("SELECT p FROM Producto p WHERE p.ownerSub = :ownerSub AND p.stock > 0")
    List<Producto> findActivosByOwnerSub(@Param("ownerSub") String ownerSub);
    
    // 3. Contar productos activos (con stock > 0) por ownerSub
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.ownerSub = :ownerSub AND p.stock > 0")
    Long countActivosByOwnerSub(@Param("ownerSub") String ownerSub);
    
    // 4. Contar todos los productos del vendedor
    Long countByOwnerSub(String ownerSub);
    
    // 5. Buscar productos por ownerSub y estado
    List<Producto> findByOwnerSubAndEstado(String ownerSub, String estado);
}