package com.ecommerce.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Auth0UserInfo {
    
    private String sub;
    private String name;
    
    @JsonProperty("given_name")
    private String givenName;
    
    @JsonProperty("family_name")
    private String familyName;
    
    private String email;
    
    @JsonProperty("email_verified")
    private Boolean emailVerified;
    
    private String picture;
    
    @JsonProperty("updated_at")
    private String updatedAt;
}