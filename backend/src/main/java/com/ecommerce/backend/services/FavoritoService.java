package com.ecommerce.backend.services;

import com.ecommerce.backend.entities.Favorito;
import com.ecommerce.backend.entities.Producto;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.exceptions.RecursoNoEncontradoException;
import com.ecommerce.backend.exceptions.DuplicadoException;
import com.ecommerce.backend.repositories.FavoritoRepository;
import com.ecommerce.backend.repositories.ProductoRepository;
import com.ecommerce.backend.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    /**
     * Obtener todos los favoritos de un usuario
     */
    @Transactional(readOnly = true)
    public List<Favorito> obtenerFavoritos(String auth0Sub) {
        log.info("📋 Obteniendo favoritos del usuario: {}", auth0Sub);
        
        List<Favorito> favoritos = favoritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        log.info("✅ Se encontraron {} favoritos", favoritos.size());
        
        return favoritos;
    }

    /**
     * Agregar producto a favoritos
     */
    @Transactional
    public Favorito agregarFavorito(String auth0Sub, Long productoId) {
        log.info("❤️ Agregando producto {} a favoritos del usuario: {}", productoId, auth0Sub);

        // 1. Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findByAuth0Sub(auth0Sub)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        // 2. Verificar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productoId));

        // 3. Verificar que no esté ya en favoritos
        if (favoritoRepository.existsByAuth0SubAndProductoId(auth0Sub, productoId)) {
            throw new DuplicadoException("Este producto ya está en tus favoritos");
        }

        // 4. Crear y guardar favorito
        Favorito favorito = new Favorito(usuario, producto);
        Favorito guardado = favoritoRepository.save(favorito);

        log.info("✅ Favorito agregado exitosamente con ID: {}", guardado.getId());

        return guardado;
    }

    /**
     * Eliminar producto de favoritos
     */
    @Transactional
    public void eliminarFavorito(String auth0Sub, Long productoId) {
        log.info("💔 Eliminando producto {} de favoritos del usuario: {}", productoId, auth0Sub);

        Favorito favorito = favoritoRepository.findByAuth0SubAndProductoId(auth0Sub, productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Este producto no está en tus favoritos"));

        favoritoRepository.delete(favorito);

        log.info("✅ Favorito eliminado exitosamente");
    }

    /**
     * Toggle favorito (agregar si no existe, eliminar si existe)
     * Retorna: Favorito si se agregó, null si se eliminó
     */
    @Transactional
    public Favorito toggleFavorito(String auth0Sub, Long productoId) {
        log.info("🔄 Toggle favorito - Producto: {}, Usuario: {}", productoId, auth0Sub);

        boolean existe = favoritoRepository.existsByAuth0SubAndProductoId(auth0Sub, productoId);

        if (existe) {
            eliminarFavorito(auth0Sub, productoId);
            return null; // Indica que se eliminó
        } else {
            return agregarFavorito(auth0Sub, productoId);
        }
    }

    /**
     * Verificar si un producto está en favoritos
     */
    @Transactional(readOnly = true)
    public boolean esFavorito(String auth0Sub, Long productoId) {
        return favoritoRepository.existsByAuth0SubAndProductoId(auth0Sub, productoId);
    }

    /**
     * Contar favoritos de un usuario
     */
    @Transactional(readOnly = true)
    public long contarFavoritos(String auth0Sub) {
        Usuario usuario = usuarioRepository.findByAuth0Sub(auth0Sub)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        
        return favoritoRepository.countByUsuario_Id(usuario.getId());
    }

    /**
     * Obtener IDs de productos favoritos (útil para el frontend)
     */
    @Transactional(readOnly = true)
    public List<Long> obtenerIdsFavoritos(String auth0Sub) {
        List<Favorito> favoritos = favoritoRepository.findByUsuarioAuth0SubOrderByAgregadoEnDesc(auth0Sub);
        
        return favoritos.stream()
                .map(f -> f.getProducto().getId())
                .collect(Collectors.toList());
    }
}