package com.ecommerce.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final AudienceValidator audienceValidator;
    private final String issuer;
    private final String allowedOrigins;

    public SecurityConfig(
            AudienceValidator audienceValidator,
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.audienceValidator = audienceValidator;
        this.issuer = issuer;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilita CSRF
            .csrf(csrf -> csrf.disable())
            
            // 2. Configura CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. Configura autorizaciones
            .authorizeHttpRequests(auth -> auth
                // ¡IMPORTANTE! Permite todas las peticiones OPTIONS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Rutas públicas
                .requestMatchers(
                    "/health", 
                    "/api/public/**",
                    "/error"
                ).permitAll()
                
                // Todas las demás requieren autenticación
                .anyRequest().authenticated()
            )
            
            // 4. Configura Auth0
            .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt
                .jwtAuthenticationConverter(jwtAuthConverter())));

        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = JwtDecoders.fromIssuerLocation(issuer);
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);
        decoder.setJwtValidator(validator);
        return decoder;
    }

    @Bean
    Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthConverter() {
        return new JwtAuthConverter();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        
        // Procesa los orígenes desde la variable
        String[] origins = allowedOrigins.split(",");
        for (String origin : origins) {
            String trimmedOrigin = origin.trim();
            if (!trimmedOrigin.isEmpty()) {
                cfg.addAllowedOriginPattern(trimmedOrigin);
            }
        }
        
        // Añade localhost para desarrollo (si no está en la variable)
        cfg.addAllowedOriginPattern("http://localhost:4200");
        cfg.addAllowedOriginPattern("http://localhost:3000");
        
        // Métodos permitidos
        cfg.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
        ));
        
        // Headers permitidos (más completos)
        cfg.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-Access-Token"
        ));
        
        // Headers expuestos
        cfg.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-Access-Token"
        ));
        
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}