package com.ecommerce.backend.entities;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String titulo;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String estado; 

    @Column(length = 2000)
    private String descripcion;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double precio;

    @PositiveOrZero
    @Column(nullable = false)
    private Integer stock = 1;

    // ⚠️ MANTENER CAMPO ANTIGUO para retrocompatibilidad
    @Column(name = "imagen_url")
    private String imagenUrl;

    // 🆕 NUEVO: Múltiples imágenes (se guarda en tabla separada)
    @ElementCollection
    @CollectionTable(
        name = "producto_imagenes",
        joinColumns = @JoinColumn(name = "id_producto")
    )
    @Column(name = "imagen_url", length = 2048)
    private List<String> imagenesUrl = new ArrayList<>();

    @NotBlank
    @Column(name = "categoria", nullable = false, length = 80)
    private String categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_usuario",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_productos_usuarios")
    )
    private Usuario owner;

    @Column(name = "owner_sub", nullable = false, length = 128)
    private String ownerSub;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en")
    private Instant actualizadoEn;

    @PrePersist
    public void prePersist() {
        if (creadoEn == null) creadoEn = Instant.now();
        actualizadoEn = creadoEn;
        if ((ownerSub == null || ownerSub.isBlank()) && owner != null && owner.getAuth0Sub() != null) {
            ownerSub = owner.getAuth0Sub();
        }
        
        // 🔄 Migración automática: Si existe imagenUrl antigua, moverla a imagenesUrl
        if (imagenUrl != null && !imagenUrl.isBlank() && imagenesUrl.isEmpty()) {
            imagenesUrl.add(imagenUrl);
        }
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = Instant.now();
    }

    @JsonIgnore
    public Usuario getOwner() {
        return owner;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public void setOwner(Usuario owner) {
        this.owner = owner;
    }

    @JsonProperty("ownerId")
    public Long getOwnerId() {
        return (owner != null ? owner.getId() : null);
    }

    // 🆕 Obtener imagen principal (la primera)
    @JsonProperty("imagenPrincipal")
    public String getImagenPrincipal() {
        if (imagenesUrl != null && !imagenesUrl.isEmpty()) {
            return imagenesUrl.get(0);
        }
        // Fallback: si no hay nuevas, devolver la antigua
        return imagenUrl;
    }
}