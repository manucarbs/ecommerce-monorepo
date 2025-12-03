// src/main/java/com/ecommerce/backend/controllers/UsuarioController.java
package com.ecommerce.backend.controllers;

import java.util.Map;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.UsuarioCreateDTO;
import com.ecommerce.backend.entities.Usuario;
import com.ecommerce.backend.repositories.UsuarioRepository;
import com.ecommerce.backend.services.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequestMapping("/api/private/users")
@RequiredArgsConstructor
public class UsuarioController {

  private final UsuarioService usuarioService;
  private final UsuarioRepository usuarioRepository;

  @GetMapping("/me")
  public ResponseEntity<Usuario> me(@AuthenticationPrincipal Jwt jwt) {
    Usuario u = usuarioService.ensureFromJwt(jwt);
    return ResponseEntity.ok(u);
  }

  @PostMapping(consumes = "application/json", produces = "application/json")
  public ResponseEntity<?> create(@RequestBody @Valid UsuarioCreateDTO dto, BindingResult br) {

    if (br.hasErrors()) {
      var errors = br.getFieldErrors().stream()
        .map(e -> Map.of("field", e.getField(), "message", e.getDefaultMessage()))
        .toList();
      return ResponseEntity.badRequest().body(errors);
    }

    Optional<Usuario> bySub = usuarioRepository.findByAuth0Sub(dto.getAuth0Sub());
    if (bySub.isPresent()) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "DUPLICATE_SUB", "message", "Ya existe un usuario con ese auth0Sub."));
    }

    Usuario u = new Usuario();
    u.setAuth0Sub(dto.getAuth0Sub());
    u.setEmail(dto.getEmail());
    u.setNombre(dto.getNombre());
    u.setApellido(dto.getApellido());
    u.setPictureUrl(dto.getPictureUrl());

    Usuario saved = usuarioRepository.save(u);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @PostMapping(value = "/provision", produces = "application/json")
  public ResponseEntity<Usuario> provisionFromJwt(@AuthenticationPrincipal Jwt jwt) {
    String sub = jwt.getClaimAsString("sub");
    boolean existed = usuarioRepository.existsByAuth0Sub(sub);
    Usuario saved = usuarioService.ensureFromJwt(jwt);
    return existed ? ResponseEntity.ok(saved) : ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @DeleteMapping("/me")
  public ResponseEntity<?> deleteMe(@AuthenticationPrincipal Jwt jwt) {
    String sub = jwt.getClaimAsString("sub");

    Optional<Usuario> existing = usuarioRepository.findByAuth0Sub(sub);
    if (existing.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "NOT_FOUND", "message", "No hay usuario provisionado."));
    }

    try {
      usuarioRepository.deleteById(existing.get().getId());
      return ResponseEntity.noContent().build();
    } catch (DataIntegrityViolationException dive) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "FK_CONSTRAINT", "message", "No se puede eliminar: tiene productos asociados."));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteById(@PathVariable Long id) {
    Optional<Usuario> existing = usuarioRepository.findById(id);
    if (existing.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "NOT_FOUND", "message", "Usuario no existe."));
    }

    try {
      usuarioRepository.deleteById(id);
      return ResponseEntity.noContent().build();
    } catch (DataIntegrityViolationException dive) {

      return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", "FK_CONSTRAINT", "message", "No se puede eliminar: tiene productos asociados."));
    }
  }

  @PatchMapping("/me/picture")
  public ResponseEntity<?> updatePicture(
      @AuthenticationPrincipal Jwt jwt,
      @RequestBody Map<String, String> body) {

    String pictureUrl = body.get("pictureUrl");
    if (pictureUrl == null || pictureUrl.isBlank()) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", "INVALID_URL", "message", "La URL de la foto es requerida"));
    }

    Usuario u = usuarioService.ensureFromJwt(jwt);
    u.setPictureUrl(pictureUrl);
    Usuario saved = usuarioRepository.save(u);

    return ResponseEntity.ok(saved);
  }
}