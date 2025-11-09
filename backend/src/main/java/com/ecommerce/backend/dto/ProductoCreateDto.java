package com.ecommerce.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoCreateDto {

    @NotBlank
    @Size(max = 120)
    private String titulo;

    @NotBlank
    @Size(max = 80)
    private String categoria;

    @NotBlank
    @Size(max = 20)
    private String estado;

    @Size(max = 2000)
    private String descripcion;

    @NotNull
    @PositiveOrZero
    private Double precio;

    @PositiveOrZero
    private Integer stock = 1;

    // 🆕 Soporta múltiples imágenes
    @Size(max = 5, message = "Máximo 5 imágenes por producto")
    private List<@Size(max = 2048) String> imagenesUrl = new ArrayList<>();

    // ⚠️ RETROCOMPATIBILIDAD: Mantener por si el frontend antiguo envía imagenUrl
    private String imagenUrl;
}