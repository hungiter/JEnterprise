package org.java_enterprise.backend.api_gateway.storage.controller;

import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/pay")
public class VnpayMicroserviceController {

    @Value("${vnpay_service.url}")
    private String vnpayServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AppHeaders appHeaders;

    @GetMapping
    public ResponseEntity<String> checkEndpoint() {
        return ResponseEntity.ok("Endpoint is working!");
    }

    // POST create user
    @PostMapping
    public ResponseEntity<String> createPaymentLink(@RequestBody String vnpayJson) {
        return forwardRequest(HttpMethod.POST, "", vnpayJson);
    }

    // ============================ Utility methods =================================

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path) {
        return forwardRequest(method, path, null);
    }

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path, String body) {
        HttpHeaders headers = appHeaders.getHeaders();
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        String url = vnpayServiceUrl + path;
        System.out.println(url);
        System.out.println(entity);

        try {
            return restTemplate.exchange(url, method, entity, String.class);
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
