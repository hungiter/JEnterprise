package org.java_enterprise.backend.api_gateway.config;

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
                        .allowedOrigins("*") // React URL
                        .allowedOrigins("http://localhost:5173","ultimately-flowing-stag.ngrok-free.app","pure-calf-lively.ngrok-free.app") // React URL
                        .allowedMethods("*");
            }
        };
    }
}