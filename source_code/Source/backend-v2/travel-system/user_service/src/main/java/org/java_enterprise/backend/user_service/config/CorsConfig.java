package org.java_enterprise.backend.user_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                                "http://localhost:80", //
                                "http://localhost:8080", //
                                "http://localhost:8081", //
                                "https://ultimately-flowing-stag.ngrok-free.app", //
                                "https://pure-calf-lively.ngrok-free.app") // React URL
                        .allowedMethods("*");
            }
        };
    }
}