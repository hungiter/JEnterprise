package org.java_enterprise.backend.user_service.storage.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.java_enterprise.backend.user_service.storage.model.*;
import org.java_enterprise.backend.user_service.storage.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Validator;

import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    private final AuthService authService;

    @Autowired
    private Validator validator; // Inject the validator

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        // If there are validation errors, print them and return a bad request response
        if (!violations.isEmpty()) {
            AuthError authError = new AuthError();
            violations.forEach(violation -> {
                String params = violation.getPropertyPath().toString();
                String message = violation.getMessage();
                switch (params) {
                    case "email":
                        authError.setEmail(message);
                        break;
                    case "username":
                        authError.setUsername(message);
                        break;
                    case "password":
                        authError.setPassword(message);
                        break;
                    default:
                        break;
                }
            });

            return ResponseEntity.ok().body(AuthResponse.builder()
                    .success(false)
                    .message("Validation failed")
                    .error(authError)
                    .build());
        }

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(
            @Valid @RequestBody LoginRequest request) {
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            AuthError authError = new AuthError();
            violations.forEach(violation -> {
                String params = violation.getPropertyPath().toString();
                String message = violation.getMessage();
                switch (params) {
                    case "email":
                        authError.setEmail(message);
                        break;
                    case "password":
                        authError.setPassword(message);
                        break;
                    default:
                        break;
                }
            });

            return ResponseEntity.ok().body(AuthResponse.builder()
                    .success(false)
                    .message("Validation failed")
                    .error(authError)
                    .build());
        }

        AuthResponse response = authService.authenticate(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestBody ChangePasswordRequest request) {
        Set<ConstraintViolation<ChangePasswordRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            AuthError authError = new AuthError();
            violations.forEach(violation -> {
                String params = violation.getPropertyPath().toString();
                String message = violation.getMessage();
                switch (params) {
                    case "username":
                        authError.setUsername(message);
                        break;
                    case "oldPassword":
                        authError.setOldPassword(message);
                        break;
                    case "newPassword":
                        authError.setNewPassword(message);
                        break;
                    default:
                        break;
                }
            });

            return ResponseEntity.ok().body(AuthResponse.builder()
                    .success(false)
                    .message("Validation failed")
                    .error(authError)
                    .build());
        }
        AuthResponse response = authService.changePassword(request.getUsername(), request.getOldPassword(),
                request.getNewPassword());
        return ResponseEntity.ok(response);
    }
}
