package org.java_enterprise.backend.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/api/users/**",
            "/api/tours/**",
            "/api/ai/**",
            "/api/pay/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable) // Disable CSRF (if needed)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll() // Public endpoints
                        .anyRequest().authenticated() // Secure other endpoints
                )
                .formLogin(AbstractHttpConfigurer::disable) // Disable default login form
                .httpBasic(AbstractHttpConfigurer::disable); // Disable Basic Auth (if not needed)

        return http.build();
    }
}

