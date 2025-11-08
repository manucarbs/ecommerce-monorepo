package com.ecommerce.backend.services;

import com.ecommerce.backend.dto.Auth0UserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class Auth0UserInfoService {

    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    public Auth0UserInfo getUserInfo(String accessToken) {
        String userInfoEndpoint = issuerUri + "userinfo";
        
        log.debug("Llamando a Auth0 userinfo endpoint: {}", userInfoEndpoint);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<Auth0UserInfo> response = restTemplate.exchange(
                userInfoEndpoint,
                HttpMethod.GET,
                entity,
                Auth0UserInfo.class
            );
            
            Auth0UserInfo userInfo = response.getBody();
            log.debug("UserInfo obtenido: email={}, name={}", 
                userInfo != null ? userInfo.getEmail() : null,
                userInfo != null ? userInfo.getName() : null
            );
            
            return userInfo;
            
        } catch (Exception e) {
            log.error("Error al obtener userinfo de Auth0: {}", e.getMessage());
            throw new RuntimeException("No se pudo obtener información del usuario desde Auth0", e);
        }
    }
}