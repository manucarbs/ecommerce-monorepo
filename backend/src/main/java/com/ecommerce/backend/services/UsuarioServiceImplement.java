// src/main/java/com/ecommerce/backend/services/UsuarioServiceImplement.java
package com.ecommerce.backend.services;

import java.util.Optional;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioServiceImplement implements UsuarioService {

  private final UsuarioRepository usuarioRepository;

  @Override
  @Transactional
  public Usuario ensureFromJwt(Jwt jwt) {
    String sub     = jwt.getClaimAsString("sub");
    String email   = jwt.getClaimAsString("email");
    String name    = jwt.getClaimAsString("name");
    String picture = jwt.getClaimAsString("picture");


    Optional<Usuario> existing = usuarioRepository.findByAuth0Sub(sub);

    if (existing.isPresent()) {
      Usuario u = existing.get();
      if (email != null)   u.setEmail(email);
      if (name != null)    u.setNombre(name);
      if (picture != null) u.setPictureUrl(picture);
      Usuario saved = usuarioRepository.save(u);
      return saved;
    }

    Usuario u = new Usuario();
    u.setAuth0Sub(sub);
    u.setEmail(email != null ? email : "unknown@local");
    u.setNombre(name);
    u.setPictureUrl(picture);

    try {
      Usuario saved = usuarioRepository.save(u);
      return saved;
    } catch (DataIntegrityViolationException dive) {
      return usuarioRepository.findByAuth0Sub(sub).orElseThrow(() -> dive);
    }
  }

  @Override
  public Optional<Usuario> findByAuth0Sub(String sub) {
    return usuarioRepository.findByAuth0Sub(sub);
  }
}
