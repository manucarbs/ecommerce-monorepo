package com.ecommerce.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class UsuarioCreateDTO {

  @NotBlank
  private String auth0Sub;  

  @NotBlank @Email
  private String email;

  // opcionales
  private String nombre;
  private String apellido;
  private String pictureUrl;
}
