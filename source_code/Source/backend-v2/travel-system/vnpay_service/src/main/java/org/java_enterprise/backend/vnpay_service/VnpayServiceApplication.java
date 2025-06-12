
package org.java_enterprise.backend.vnpay_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class VnpayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(VnpayServiceApplication.class, args);
    }

    @GetMapping("/api/user-services/hello")
    public String hello() {
        return "Hello from user-service-service!";
    }
}
