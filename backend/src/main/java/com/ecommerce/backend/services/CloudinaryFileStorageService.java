package com.ecommerce.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class CloudinaryFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryFileStorageService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
        
        log.info("✅ Cloudinary configurado correctamente - Cloud: {}", cloudName);
    }

    @Override
    public String store(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("El archivo está vacío");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IOException("Nombre de archivo inválido");
        }

        // Validar extensión
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!isValidExtension(extension)) {
            throw new IOException("Solo se permiten archivos JPG y PNG");
        }

        // Generar public_id único
        String publicId = folder + "/" + UUID.randomUUID().toString();

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", folder,
                            "resource_type", "image",
                            "allowed_formats", new String[] { "jpg", "png", "jpeg" }));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("✅ Archivo subido a Cloudinary: {}", secureUrl);
            
            return secureUrl;
            
        } catch (Exception e) {
            log.error("❌ Error al subir archivo a Cloudinary", e);
            throw new IOException("No se pudo subir el archivo: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String url) throws IOException {
        if (url == null || url.isBlank()) {
            return;
        }

        try {
            String publicId = extractPublicIdFromUrl(url);
            if (publicId.isEmpty()) {
                log.warn("⚠️ No se pudo extraer public_id de la URL: {}", url);
                return;
            }

            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");
            
            if ("ok".equals(resultStatus)) {
                log.info("✅ Archivo eliminado de Cloudinary: {}", publicId);
            } else {
                log.warn("⚠️ Cloudinary devolvió status: {} para {}", resultStatus, publicId);
            }
            
        } catch (Exception e) {
            log.error("❌ Error al eliminar archivo de Cloudinary: {}", url, e);
            throw new IOException("No se pudo eliminar el archivo", e);
        }
    }

    @Override
    public void deleteMultiple(List<String> urls) throws IOException {
        if (urls == null || urls.isEmpty()) {
            return;
        }

        log.info("🗑️ Eliminando {} archivos de Cloudinary", urls.size());
        
        for (String url : urls) {
            try {
                delete(url);
            } catch (IOException e) {
                log.error("❌ Error al eliminar {}: {}", url, e.getMessage());
                // Continuar con los demás archivos aunque uno falle
            }
        }
    }

    @Override
    public boolean exists(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }

        try {
            String publicId = extractPublicIdFromUrl(url);
            if (publicId.isEmpty()) {
                return false;
            }

            Map result = cloudinary.api().resource(publicId, ObjectUtils.emptyMap());
            return result != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extrae el public_id de una URL de Cloudinary
     * URL: https://res.cloudinary.com/dtlyhwbuw/image/upload/v123/productos/abc.jpg
     * public_id: productos/abc
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            String[] parts = url.split("/upload/");
            if (parts.length < 2) return "";
            
            String afterUpload = parts[1];
            // Remover versión (v123/)
            String withoutVersion = afterUpload.replaceFirst("v\\d+/", "");
            // Remover extensión
            return withoutVersion.replaceFirst("\\.[^.]+$", "");
        } catch (Exception e) {
            log.error("Error al extraer public_id de URL: {}", url, e);
            return "";
        }
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return (lastDot == -1) ? "" : filename.substring(lastDot + 1);
    }

    private boolean isValidExtension(String extension) {
        return extension.equals("jpg") ||
                extension.equals("jpeg") ||
                extension.equals("png");
    }
}