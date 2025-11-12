package com.ecommerce.backend.services;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

/**
 * Interfaz para el servicio de almacenamiento de archivos en Cloudinary
 */
public interface FileStorageService {
    
    /**
     * Almacena un archivo y devuelve su URL pública
     * @param file Archivo a almacenar
     * @param folder Carpeta donde guardar (ej: "productos")
     * @return URL pública del archivo en Cloudinary
     */
    String store(MultipartFile file, String folder) throws IOException;
    
    /**
     * Elimina un archivo por su URL
     * @param url URL del archivo a eliminar
     */
    void delete(String url) throws IOException;
    
    /**
     * Elimina múltiples archivos
     * @param urls Lista de URLs a eliminar
     */
    void deleteMultiple(List<String> urls) throws IOException;
    
    /**
     * Verifica si un archivo existe
     * @param url URL del archivo
     * @return true si existe, false si no
     */
    boolean exists(String url);
}