package org.java_enterprise.backend.api_gateway.storage.controller;

import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
    public ResponseEntity<String> checkEndpoint() {
        return ResponseEntity.ok("Endpoint is working!");
    }

    @GetMapping("/all")
    public ResponseEntity<String> getAllTours() {
        return forwardRequest(HttpMethod.GET, "");
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

    // INSTANCE CONTROLLER
    @GetMapping("/instances/all/{tourCode}")
    public ResponseEntity<String> getTourInstanceSummaries(@PathVariable("tourCode") String tourCode) {
        return forwardRequest(HttpMethod.GET, "/instances/all/" + tourCode);
    }

    @GetMapping("/instances/info/{instanceId}")
    public ResponseEntity<String> getTourInstanceInfo(@PathVariable("instanceId") String instanceId) {
        return forwardRequest(HttpMethod.GET, "/instances/info/" + instanceId);
    }

    // TAG CONTROLLER=======================================
    @GetMapping("/tags")
    public ResponseEntity<String> getAllTags() {
        return forwardRequest(HttpMethod.GET, "/tags");
    }

    @GetMapping("/tags/find")
    public ResponseEntity<String> getTagsByString(@RequestParam("input") String input) {
        String forwardUrl = "/tags/find?input=" + UriUtils.encode(input, StandardCharsets.UTF_8);
        return forwardRequest(HttpMethod.GET, forwardUrl);
    }

    // ENGAGEMENT CONTROLLER================================
    @GetMapping("/engagement")
    public ResponseEntity<String> getAllEngagements() {
        return forwardRequest(HttpMethod.GET, "/engagement");
    }

    @GetMapping("/engagement/find")
    public ResponseEntity<String> findEngagements(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String tourId
    ) {
        List<String> params = new ArrayList<>();

        if (username != null) {
            params.add("username=" + UriUtils.encode(username, StandardCharsets.UTF_8));
        }

        if (tourId != null) {
            params.add("tourId=" + UriUtils.encode(tourId, StandardCharsets.UTF_8));
        }

        String queryString = String.join("&", params);
        String forwardUrl = "/engagement/find" + (queryString.isEmpty() ? "" : "?" + queryString);

        return forwardRequest(HttpMethod.GET, forwardUrl);
    }

    @PutMapping("/engagement")
    public ResponseEntity<String> updateEngagement(@RequestBody String requestJson) {
        return forwardRequest(HttpMethod.PUT, "/engagement", requestJson);
    }

    // ORDER CONTROLLER=====================================
    @GetMapping("/order")
    public ResponseEntity<String> getAllTourOrders() {
        return forwardRequest(HttpMethod.GET, "/order");
    }

    @GetMapping("/order/find")
    public ResponseEntity<String> findOrders(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String instanceId
    ) {
        List<String> params = new ArrayList<>();

        if (username != null) {
            params.add("username=" + UriUtils.encode(username, StandardCharsets.UTF_8));
        }

        if (instanceId != null) {
            params.add("instanceId=" + UriUtils.encode(instanceId, StandardCharsets.UTF_8));
        }

        String queryString = String.join("&", params);
        String forwardUrl = "/order/find" + (queryString.isEmpty() ? "" : "?" + queryString);

        return forwardRequest(HttpMethod.GET, forwardUrl);
    }

    @PostMapping("/order/create")
    public ResponseEntity<String> createOrder(@RequestBody String requestJson) {
        return forwardRequest(HttpMethod.POST, "/order/create", requestJson);
    }

    @PutMapping("/order/accept")
    public ResponseEntity<String> acceptOrder(@RequestBody String requestJson) {
        return forwardRequest(HttpMethod.PUT, "/order/update", requestJson);
    }
    @PutMapping("/order/reject")
    public ResponseEntity<String> rejectOrder(@RequestBody String requestJson) {
        return forwardRequest(HttpMethod.PUT, "/order/reject", requestJson);
    }

    // ========================== Utility ==========================
    private ResponseEntity<String> forwardRequest(HttpMethod method, String path) {
        return forwardRequest(method, path, null);
    }

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path, String body) {
        HttpHeaders headers = appHeaders.getHeaders();
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        String url = tourServiceUrl + path;

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
