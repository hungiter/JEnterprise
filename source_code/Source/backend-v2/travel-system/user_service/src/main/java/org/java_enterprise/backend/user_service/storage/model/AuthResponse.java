package org.java_enterprise.backend.user_service.storage.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Boolean success;
    private String message;
    private AuthData data;
    private AuthError error;
}

