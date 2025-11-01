package com.ecommerce.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Email(message = "Correo inválido")
    @NotBlank(message = "El correo es obligatorio")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;

    private String direccion;
    private String telefono;

    @Column(name = "fecha_registro", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaRegistro;

    private String rol = "cliente";
}