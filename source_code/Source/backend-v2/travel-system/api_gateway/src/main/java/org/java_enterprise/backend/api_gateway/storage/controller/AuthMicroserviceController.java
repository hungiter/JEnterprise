package org.java_enterprise.backend.api_gateway.storage.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import org.java_enterprise.backend.api_gateway.storage.utils.AppHeaders;
import org.java_enterprise.backend.api_gateway.storage.utils.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static java.awt.SystemColor.info;

@RestController
@RequestMapping("/api/auth")
public class AuthMicroserviceController {

    @Value("${auth_service.url}")
    private String authServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private AppHeaders appHeaders;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public ResponseEntity<String> checkEndpoint() {
        return ResponseEntity.ok("Endpoint is working!");
    }

    private Map<String, String> user_cache = new HashMap<>();

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

    // POST /logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        ResponseEntity<String> response = check_token(request);
        if (response.getStatusCode() == HttpStatus.OK) {
            String token = response.getBody();
            user_cache.remove(token);
            System.out.println("Đăng xuất thành công");
            return ResponseEntity.ok("Đăng xuất thành công");
        } else {
            System.out.println("Đăng xuất thất bại");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Đăng xuất thất bại");
        }
    }

    // POST /change-password
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(HttpServletRequest request, @RequestBody String changePasswordRequestJson) {
        ResponseEntity<String> response = check_token(request);
        if (response.getStatusCode() == HttpStatus.OK) {
            return forwardRequest(HttpMethod.POST, "/change-password", changePasswordRequestJson);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chưa đăng nhập");
        }
    }

    @PostMapping("/check_token")
    public ResponseEntity<String> check_token(HttpServletRequest request) {
        // Kiểm tra header có bắt đầu bằng "Bearer "
        String authHeader = request.getHeader("Authorization");
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode errorJson = mapper.createObjectNode();
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            boolean isValid = jwtService.validateToken(authHeader);
            String token = authHeader.substring(7); // Cắt bỏ "Bearer " để lấy token
            if (!isValid) {
                user_cache.remove(token);
                errorJson.put("error", "Token is expired or invalid");
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(errorJson.toString());
            }

            try {
                String info = getTokenInfo(token); // Đã là JSON string
                JsonNode root = mapper.readTree(info);
                if (root != null && root.has("username") && !root.get("username").isNull()) {
                    return ResponseEntity.ok(info); // Trả JSON string trực tiếp
                } else {
                    errorJson.put("statusCode", "401");
                    errorJson.put("error", "Vui lòng đăng nhập lại");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorJson.toString()); // Trả JSON string
                                                                                                      // trực tiếp
                }
            } catch (Exception e) {
                errorJson.put("error", "Error parsing token info");
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(errorJson.toString());
            }
        } else {
            errorJson.put("error", "Invalid or missing Authorization header");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(errorJson.toString());
        }
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
            ResponseEntity<String> response = restTemplate.exchange(url, method, entity, String.class);
            String responseBody = response.getBody();
            HttpStatusCode responseStatus = response.getStatusCode();

            // Gọi lại tới URL mới mà nó redirect tới
            if (Objects.equals(path, "/login")) {
                if (responseStatus.is3xxRedirection()) {
                    URI redirectUri = response.getHeaders().getLocation();
                    if (redirectUri != null) {
                        ResponseEntity<String> redirectResponse = restTemplate.exchange(redirectUri, method, entity,
                                String.class);
                        responseBody = redirectResponse.getBody();
                        responseStatus = redirectResponse.getStatusCode();
                        ObjectMapper objectMapper = new ObjectMapper();
                        JsonNode root = null;
                        try {
                            root = objectMapper.readTree(redirectResponse.getBody());
                            // Check if "data" exists and is not null
                            if (root.has("data") && !root.get("data").isNull()) {
                                JsonNode dataNode = root.get("data");
                                String token = dataNode.get("token").asText();
                                String username = dataNode.get("username").asText();
                                String role = dataNode.get("role").asText();
                                cacheToken(token, username, role);
                            }
                        } catch (Exception e) {
                            System.out.println("/login: " + e);
                        }
                    }
                }
            }

            // Create BODY
            if (responseStatus == HttpStatus.OK) {
                return ResponseEntity.ok(responseBody);
            } else {
                return response;
            }
        } catch (Exception e) {
            System.out.println(url);
            System.out.println(entity);
            System.out.println(e.toString());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ============================= Cache Utility ========================
    private void cacheToken(String token, String username, String role) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode json = mapper.createObjectNode();
        json.put("username", username);
        json.put("role", role);
        String info = json.toString();

        // Cache cache = cacheManager.getCache("token");
        // if (cache != null) {
        // System.out.println(info);
        // cache.put(token, info);
        // }

        // REMOVE OLD - 1 device in time
        String oldKey = null;
        for (Map.Entry<String, String> entry : user_cache.entrySet()) {
            if (entry.getValue().equals(info)) {
                oldKey = entry.getKey();
                break; // remove this if you want to replace all matches
            }
        }
        if (oldKey != null) {
            user_cache.remove(oldKey); // remove old key
        }

        if (!user_cache.containsKey(token)) {
            user_cache.put(token, info);
            System.out.println(user_cache);
        }
    }

    private String getTokenInfo(String token) {
        // Cache cache = cacheManager.getCache("token");
        // if (cache != null) {
        // try {
        // Cache.ValueWrapper valueWrapper = cache.get(token);
        // if (valueWrapper != null) {
        // return Objects.requireNonNull(valueWrapper.get()).toString(); // Trả về chuỗi
        // JSON
        // }
        // } catch (Exception e) {
        // // Có thể log lỗi nếu cần
        // System.out.println("getTokenInfo: " + e);
        // return "{}"; // Trả về JSON rỗng nếu có lỗi
        // }
        // }
        // return "{}";
        System.out.println(user_cache);
        String info = user_cache.get(token);
        if (info != null) {
            return info;
        }
        return "{}";
    }
}