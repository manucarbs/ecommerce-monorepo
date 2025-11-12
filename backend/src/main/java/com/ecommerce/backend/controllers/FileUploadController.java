package com.ecommerce.backend.controllers;

import com.ecommerce.backend.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/private/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int MAX_FILES = 5;

    /**
     * Sube UN archivo a Cloudinary
     * POST /api/private/files/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadSingleFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "productos") String folder,
            @AuthenticationPrincipal Jwt jwt) {
        
        try {
            String userSub = jwt.getClaimAsString("sub");
            log.info("📤 Usuario {} subiendo archivo: {}", userSub, file.getOriginalFilename());
            
            // Validar que no esté vacío
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "EMPTY_FILE", "message", "El archivo está vacío"));
            }

            // Validar tamaño (5MB)
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "FILE_TOO_LARGE", 
                                 "message", "El archivo excede 5MB"));
            }

            // Validar tipo MIME
            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.equals("image/jpeg") && 
                 !contentType.equals("image/png"))) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "INVALID_TYPE", 
                                 "message", "Solo se permiten imágenes JPG y PNG"));
            }

            // Subir a Cloudinary
            String url = fileStorageService.store(file, folder);
            
            return ResponseEntity.ok(Map.of(
                "url", url,
                "filename", file.getOriginalFilename(),
                "size", file.getSize()
            ));
            
        } catch (IOException e) {
            log.error("❌ Error al subir archivo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "UPLOAD_FAILED", 
                             "message", e.getMessage()));
        }
    }

    /**
     * Sube MÚLTIPLES archivos a Cloudinary
     * POST /api/private/files/upload-multiple
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<?> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "productos") String folder,
            @AuthenticationPrincipal Jwt jwt) {
        
        try {
            String userSub = jwt.getClaimAsString("sub");
            log.info("📤 Usuario {} subiendo {} archivos", userSub, files.length);
            
            // Validar que haya archivos
            if (files.length == 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "NO_FILES", "message", "No se enviaron archivos"));
            }

            // Validar límite de archivos
            if (files.length > MAX_FILES) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "TOO_MANY_FILES", 
                                 "message", "Máximo " + MAX_FILES + " imágenes por vez"));
            }

            List<Map<String, Object>> uploadedFiles = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            // Procesar cada archivo
            for (MultipartFile file : files) {
                try {
                    if (file.isEmpty()) {
                        errors.add(file.getOriginalFilename() + ": archivo vacío");
                        continue;
                    }
                    
                    if (file.getSize() > MAX_FILE_SIZE) {
                        errors.add(file.getOriginalFilename() + ": excede 5MB");
                        continue;
                    }

                    String contentType = file.getContentType();
                    if (contentType == null || 
                        (!contentType.equals("image/jpeg") && 
                         !contentType.equals("image/png"))) {
                        errors.add(file.getOriginalFilename() + ": tipo no permitido");
                        continue;
                    }

                    String url = fileStorageService.store(file, folder);
                    uploadedFiles.add(Map.of(
                        "url", url,
                        "filename", file.getOriginalFilename(),
                        "size", file.getSize()
                    ));
                    
                } catch (IOException e) {
                    errors.add(file.getOriginalFilename() + ": " + e.getMessage());
                }
            }

            // Si ningún archivo se subió
            if (uploadedFiles.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "ALL_FAILED", 
                        "message", "No se pudo subir ningún archivo",
                        "errors", errors
                    ));
            }

            // Retornar archivos subidos + errores (si hay)
            return ResponseEntity.ok(Map.of(
                "files", uploadedFiles,
                "count", uploadedFiles.size(),
                "errors", errors
            ));
            
        } catch (Exception e) {
            log.error("❌ Error al subir múltiples archivos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "UPLOAD_FAILED", 
                             "message", "Error al procesar los archivos"));
        }
    }

    /**
     * Elimina un archivo de Cloudinary
     * DELETE /api/private/files
     */
    @DeleteMapping
    public ResponseEntity<?> deleteFile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt) {
        
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "MISSING_URL", "message", "Se requiere la URL"));
        }

        try {
            fileStorageService.delete(url);
            log.info("🗑️ Usuario {} eliminó archivo", jwt.getClaimAsString("sub"));
            return ResponseEntity.ok(Map.of("message", "Archivo eliminado"));
            
        } catch (IOException e) {
            log.error("❌ Error al eliminar archivo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "DELETE_FAILED", "message", e.getMessage()));
        }
    }
}