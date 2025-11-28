package com.ecommerce.backend.entities;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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

    @Column(name = "whatsapp_contacto", length = 20)
    private String whatsappContacto;

    // ✅ Campo JSON para almacenar múltiples imágenes en una sola columna
    @Column(name = "imagenes_json", columnDefinition = "TEXT")
    private String imagenesJson;

    // Campo transitorio (no se guarda en BD, se usa en memoria)
    @Transient
    private List<String> imagenesUrl = new ArrayList<>();

    // ObjectMapper estático para conversiones JSON
    @Transient
    private static final ObjectMapper objectMapper = new ObjectMapper();

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

    // ============ LIFECYCLE HOOKS ============

    @PrePersist
    public void prePersist() {
        if (creadoEn == null) creadoEn = Instant.now();
        actualizadoEn = creadoEn;
        if ((ownerSub == null || ownerSub.isBlank()) && owner != null && owner.getAuth0Sub() != null) {
            ownerSub = owner.getAuth0Sub();
        }
        convertirImagenesAJson();
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = Instant.now();
        convertirImagenesAJson();
    }

    @PostLoad
    public void postLoad() {
        convertirJsonAImagenes();
    }

    // ============ CONVERSIÓN JSON ↔ LIST ============

    /**
     * Convierte la lista imagenesUrl a JSON antes de guardar en BD
     */
    private void convertirImagenesAJson() {
        try {
            if (imagenesUrl != null && !imagenesUrl.isEmpty()) {
                imagenesJson = objectMapper.writeValueAsString(imagenesUrl);
                log.debug("📦 Convertido a JSON: {} imágenes", imagenesUrl.size());
            } else {
                imagenesJson = "[]";
            }
        } catch (JsonProcessingException e) {
            log.error("❌ Error al convertir imágenes a JSON", e);
            imagenesJson = "[]";
        }
    }

    /**
     * Convierte el JSON a lista después de cargar de BD
     */
    private void convertirJsonAImagenes() {
        try {
            if (imagenesJson != null && !imagenesJson.isBlank() && !imagenesJson.equals("[]")) {
                imagenesUrl = objectMapper.readValue(imagenesJson, new TypeReference<List<String>>() {});
                log.debug("📂 Cargado desde JSON: {} imágenes", imagenesUrl.size());
            } else {
                imagenesUrl = new ArrayList<>();
            }
        } catch (JsonProcessingException e) {
            log.error("❌ Error al parsear JSON de imágenes: {}", imagenesJson, e);
            imagenesUrl = new ArrayList<>();
        }
    }

    // ============ GETTERS/SETTERS PERSONALIZADOS ============

    /**
     * Getter que asegura que imagenesUrl esté cargado
     */
    public List<String> getImagenesUrl() {
        if (imagenesUrl == null || (imagenesUrl.isEmpty() && imagenesJson != null && !imagenesJson.equals("[]"))) {
            convertirJsonAImagenes();
        }
        return imagenesUrl;
    }

    /**
     * Setter que marca para conversión
     */
    public void setImagenesUrl(List<String> imagenesUrl) {
        this.imagenesUrl = imagenesUrl != null ? imagenesUrl : new ArrayList<>();
    }

    public String getWhatsappContacto() {
        return whatsappContacto;
    }
    
    public void setWhatsappContacto(String whatsappContacto) {
        this.whatsappContacto = whatsappContacto;
    }

    // ============ JSON PROPERTIES ============

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

    /**
     * Devuelve la primera imagen como imagen principal
     */
    @JsonProperty("imagenPrincipal")
    public String getImagenPrincipal() {
        List<String> imgs = getImagenesUrl();
        return (imgs != null && !imgs.isEmpty()) ? imgs.get(0) : null;
    }

    /**
     * IMPORTANTE: No exponer imagenesJson en el API
     */
    @JsonIgnore
    public String getImagenesJson() {
        return imagenesJson;
    }
}