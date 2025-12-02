package com.ecommerce.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@Data
@NoArgsConstructor
@Entity
@Table(name = "orden_items")
public class OrdenItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden_item")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_orden", nullable = false)
    @JsonBackReference // ← AGREGAR ESTO - IMPORTANTE
    private Orden orden;
    
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "owner"}) // ← Agrega esto
    private Producto producto;
    
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;
    
    @Column(name = "precio_unitario", nullable = false)
    private Double precioUnitario;
    
    @Column(name = "vendedor_sub", nullable = false, length = 128)
    private String vendedorSub;
    
    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
    
    @PrePersist
    public void prePersist() {
        if (creadoEn == null) {
            creadoEn = Instant.now();
        }
        if (precioUnitario == null && producto != null) {
            precioUnitario = producto.getPrecio();
        }
        if (vendedorSub == null && producto != null) {
            vendedorSub = producto.getOwnerSub();
        }
    }
    
    // Método para calcular subtotal
    public Double getSubtotal() {
        if (precioUnitario != null && cantidad != null) {
            return precioUnitario * cantidad;
        }
        return 0.0;
    }
}