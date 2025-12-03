package com.ecommerce.backend.services;

import java.util.Optional;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ecommerce.backend.dto.Auth0UserInfo;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioServiceImplement implements UsuarioService {

  private final UsuarioRepository usuarioRepository;
  private final Auth0UserInfoService auth0UserInfoService;

  @Override
  @Transactional
  public Usuario ensureFromJwt(Jwt jwt) {
    String sub = jwt.getClaimAsString("sub");
    String accessToken = jwt.getTokenValue();
    
    log.debug("Provisionando usuario con sub: {}", sub);
    
    // Obtener información completa del usuario desde Auth0
    Auth0UserInfo userInfo = auth0UserInfoService.getUserInfo(accessToken);
    
    // Procesar nombre y apellido
    String nombre = null;
    String apellido = null;
    
    if (userInfo.getGivenName() != null && userInfo.getFamilyName() != null) {
      // Si Auth0 devuelve given_name y family_name separados
      nombre = userInfo.getGivenName();
      apellido = userInfo.getFamilyName();
      log.debug("Usando given_name y family_name: {} {}", nombre, apellido);
    } else if (userInfo.getName() != null) {
      // Si solo viene el name completo, intentar dividirlo
      String fullName = userInfo.getName().trim();
      String[] parts = fullName.split("\\s+", 2); // Dividir en máximo 2 partes
      nombre = parts[0];
      apellido = parts.length > 1 ? parts[1] : null;
      log.debug("Dividiendo name: nombre={}, apellido={}", nombre, apellido);
    }
    
    // Buscar si ya existe el usuario
    Optional<Usuario> existing = usuarioRepository.findByAuth0Sub(sub);

    if (existing.isPresent()) {
      Usuario u = existing.get();
      log.debug("Usuario existente encontrado, actualizando datos");
      
      // Actualizar datos del usuario existente
      if (userInfo.getEmail() != null) u.setEmail(userInfo.getEmail());
      if (nombre != null) u.setNombre(nombre);
      if (apellido != null) u.setApellido(apellido);
      if (userInfo.getPicture() != null) u.setPictureUrl(userInfo.getPicture());
      
      Usuario saved = usuarioRepository.save(u);
      log.info("Usuario actualizado: id={}, email={}", saved.getId(), saved.getEmail());
      return saved;
    }

    // Crear nuevo usuario
    log.debug("Creando nuevo usuario");
    Usuario u = new Usuario();
    u.setAuth0Sub(sub);
    u.setEmail(userInfo.getEmail() != null ? userInfo.getEmail() : "unknown@local");
    u.setNombre(nombre);
    u.setApellido(apellido);
    u.setPictureUrl(userInfo.getPicture());

    try {
      Usuario saved = usuarioRepository.save(u);
      log.info("Nuevo usuario creado: id={}, email={}, nombre={} {}", 
        saved.getId(), saved.getEmail(), saved.getNombre(), saved.getApellido());
      return saved;
    } catch (DataIntegrityViolationException dive) {
      log.warn("Constraint violation al crear usuario, intentando recuperar existente");
      return usuarioRepository.findByAuth0Sub(sub).orElseThrow(() -> dive);
    }
  }

  @Override
  public Optional<Usuario> findByAuth0Sub(String sub) {
    return usuarioRepository.findByAuth0Sub(sub);
  }
}