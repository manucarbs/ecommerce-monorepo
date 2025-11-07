package com.ecommerce.backend.entities;

import java.time.Instant;

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

    @Column(name = "imagen_url")
    private String imagenUrl;

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
}
