
package org.java_enterprise.backend.guide_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class GuideServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GuideServiceApplication.class, args);
    }

    @GetMapping("/api/guide-services/hello")
    public String hello() {
        return "Hello from guide-service-service!";
    }
}
