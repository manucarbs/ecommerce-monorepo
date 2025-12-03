package com.ecommerce.backend.entities;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(
    name = "carritos",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_carritos_usuario_producto",
            columnNames = {"id_usuario", "id_producto"}
        )
    },
    indexes = {
        @Index(name = "idx_carritos_usuario", columnList = "id_usuario"),
        @Index(name = "idx_carritos_producto", columnList = "id_producto")
    }
)
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrito")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_usuario",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_carritos_usuarios")
    )
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "id_producto",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_carritos_productos")
    )
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "agregado_en", nullable = false, updatable = false)
    private Instant agregadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();

    // ============ LIFECYCLE HOOKS ============

    @PrePersist
    public void prePersist() {
        if (agregadoEn == null) {
            agregadoEn = Instant.now();
        }
        if (actualizadoEn == null) {
            actualizadoEn = Instant.now();
        }
        if (cantidad == null) {
            cantidad = 1;
        }
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = Instant.now();
    }

    // ============ JSON PROPERTIES ============

    @JsonProperty("usuarioId")
    public Long getUsuarioId() {
        return usuario != null ? usuario.getId() : null;
    }

    @JsonProperty("productoId")
    public Long getProductoId() {
        return producto != null ? producto.getId() : null;
    }

    // ============ BUSINESS METHODS ============

    /**
     * Calcula el subtotal de este carrito
     */
    @JsonProperty("subtotal")
    public Double getSubtotal() {
        if (producto != null && producto.getPrecio() != null && cantidad != null) {
            return producto.getPrecio() * cantidad;
        }
        return 0.0;
    }

    // ============ CONSTRUCTORES ============

    public Carrito(Usuario usuario, Producto producto) {
        this.usuario = usuario;
        this.producto = producto;
        this.cantidad = 1;
        this.agregadoEn = Instant.now();
        this.actualizadoEn = Instant.now();
    }

    public Carrito(Usuario usuario, Producto producto, Integer cantidad) {
        this.usuario = usuario;
        this.producto = producto;
        this.cantidad = cantidad;
        this.agregadoEn = Instant.now();
        this.actualizadoEn = Instant.now();
    }
}