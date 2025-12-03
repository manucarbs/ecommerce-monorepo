package com.ecommerce.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductoCreateDto {
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 120, message = "El título debe tener entre 3 y 120 caracteres")
    private String titulo;
    
    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;
    
    @NotBlank(message = "El estado es obligatorio")
    private String estado;
    
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 8, max = 2000, message = "La descripción debe tener entre 8 y 2000 caracteres")
    private String descripcion;
    
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private Double precio;
    
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock = 1;
    
    // 🆕 Campo para múltiples imágenes
    private java.util.List<String> imagenesUrl;
    
    // Para retrocompatibilidad
    private String imagenUrl;
    
    // 🆕 WhatsApp opcional
    @Pattern(regexp = "^$|^\\+?\\d{8,15}$", message = "Formato de WhatsApp inválido")
    private String whatsappContacto;
}