package org.java_enterprise.backend.api_gateway.storage.controller;

import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
public class AuthMicroserviceController {

    @Value("${auth_service.url}")
    private String authServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AppHeaders appHeaders;

    @GetMapping
    public ResponseEntity<String> checkEndpoint() {
        return ResponseEntity.ok("Endpoint is working!");
    }

    // POST /register
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody String registerRequestJson) {
        return forwardRequest(HttpMethod.POST, "/register", registerRequestJson);
    }

    // POST /login
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody String loginRequestJson) {
        return forwardRequest(HttpMethod.POST, "/login", loginRequestJson);
    }

    // POST /validate
    @PostMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestBody String tokenValidationJson) {
        return forwardRequest(HttpMethod.POST, "/validate", tokenValidationJson);
    }

    // ========================== Utility ==========================
    private ResponseEntity<String> forwardRequest(HttpMethod method, String path, String body) {
        HttpHeaders headers = appHeaders.getHeaders();
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        String url = authServiceUrl + path;

        try {
            return restTemplate.exchange(url, method, entity, String.class);
        } catch (Exception e) {
            System.out.println(url);
            System.out.println(entity);
            System.out.println(e.toString());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}