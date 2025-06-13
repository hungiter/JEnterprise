package org.java_enterprise.backend.api_gateway.storage.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

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

    @Autowired
    private AuthMicroserviceController authMicroserviceController;


    @GetMapping("/test-cards")
    private ResponseEntity<String> getAllTestCards() {
        return forwardRequest(HttpMethod.GET, "/get-all-test-cards");
    }

    // POST create user
    @PostMapping("/create-order")
    public ResponseEntity<String> createPaymentLink(@RequestBody String vnpayJson,
                                                    HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode errorJson = mapper.createObjectNode();
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            ResponseEntity<String> tokenCheck = authMicroserviceController.check_token(request);
            if (tokenCheck.getStatusCode().isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
                return tokenCheck;
            }

            if (tokenCheck.getStatusCode().isSameCodeAs(HttpStatus.OK)) {
                return forwardRequest(HttpMethod.POST, "/create-url", vnpayJson);
            }

            errorJson.put("error", "Unknown status: " + tokenCheck.getStatusCode());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorJson.toString());
        } else {
            errorJson.put("statusCode", "401");
            errorJson.put("error", "Thiếu Authorization trong headers");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorJson.toString());
        }
    }
    // ============================ Utility methods =================================

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path) {
        return forwardRequest(method, path, null);
    }

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path, String body) {
        HttpHeaders headers = appHeaders.getHeaders();
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        String url = vnpayServiceUrl + path;
        try {
            return restTemplate.exchange(url, method, entity, String.class);
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
