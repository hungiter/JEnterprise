package org.java_enterprise.backend.api_gateway.storage.controller;

import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/tours")
public class TourMicroserviceController {

    @Value("${tour_service.url}")
    private String tourServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AppHeaders appHeaders;

    @GetMapping
    public ResponseEntity<String> getAllTours() {
        HttpHeaders headers = appHeaders.getHeaders();

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            String url = tourServiceUrl + "/api/tours";  // Sử dụng URL từ application.properties
            return restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
