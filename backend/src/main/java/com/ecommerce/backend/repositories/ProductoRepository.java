package com.ecommerce.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.entities.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long>{
    
}
