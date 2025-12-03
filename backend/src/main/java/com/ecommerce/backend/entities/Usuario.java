package com.ecommerce.backend.entities;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(
    name = "usuarios",
    indexes = {
        @Index(name="idx_usuarios_auth0_sub", columnList="auth0_sub", unique = true)
    }
)
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "auth0_sub", nullable = false, unique = true, length = 128)
    private String auth0Sub;

    @Column(nullable = false, length=150)
    private String email;

    @Column(length=150)
    private String nombre;

    @Column(length=100)
    private String apellido;

    @Column(name="picture_url")
    private String pictureUrl;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    public Usuario(Long id) {
        this.id = id;
    }
}
