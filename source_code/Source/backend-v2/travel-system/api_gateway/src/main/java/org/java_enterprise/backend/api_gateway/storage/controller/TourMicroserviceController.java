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

    @GetMapping("/{code}")
    public ResponseEntity<String> getTour(@PathVariable("code") String code) {
        return forwardRequest(HttpMethod.GET, "/" + code);
    }

    @GetMapping("/summary")
    public ResponseEntity<String> getAllTourSummaries() {
        return forwardRequest(HttpMethod.GET, "/summary");
    }

    @PostMapping("/summary_tours")
    public ResponseEntity<String> getTours(@RequestBody String requestJson) {
        return forwardRequest(HttpMethod.POST, "/summary_tours", requestJson);
    }

    // ========================== Utility ==========================
    private ResponseEntity<String> forwardRequest(HttpMethod method, String path) {
        return forwardRequest(method, path, null);
    }

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path, String body) {
        HttpHeaders headers = appHeaders.getHeaders();
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        String url = tourServiceUrl + "/api/tours" + path;

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
