package org.java_enterprise.backend.api_gateway.storage.controller;

import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/users")
public class UserMicroserviceController {

    @Value("${user_service.url}")
    private String userServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AppHeaders appHeaders;

    @GetMapping
    public ResponseEntity<String> checkEndpoint() {
        return ResponseEntity.ok("Endpoint is working!");
    }

    // GET all users
    @GetMapping("/all")
    public ResponseEntity<String> getAllUsers() {
        return forwardRequest(HttpMethod.GET, "");
    }

    // GET user by ID
    @GetMapping("/id/{id}")
    public ResponseEntity<String> getUserById(@PathVariable("id") String id) {
        return forwardRequest(HttpMethod.GET, "/id/" + id);
    }

    // GET user by username
    @GetMapping("/name/{username}")
    public ResponseEntity<String> getUserByUsername(@PathVariable("username") String username) {
        return forwardRequest(HttpMethod.GET, "/name/" + username);
    }

    // POST create user
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody String userJson) {
        return forwardRequest(HttpMethod.POST, "", userJson);
    }

    // PUT update user
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable("id") String id, @RequestBody String userJson) {
        return forwardRequest(HttpMethod.PUT, "/" + id, userJson);
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") String id) {
        return forwardRequest(HttpMethod.DELETE, "/" + id);
    }

    // ============================ Utility methods =================================

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path) {
        return forwardRequest(method, path, null);
    }

    private ResponseEntity<String> forwardRequest(HttpMethod method, String path, String body) {
        HttpHeaders headers = appHeaders.getHeaders();
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        String url = userServiceUrl + path;
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
