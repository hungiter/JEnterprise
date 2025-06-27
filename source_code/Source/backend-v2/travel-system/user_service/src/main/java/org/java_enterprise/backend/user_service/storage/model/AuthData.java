package org.java_enterprise.backend.user_service.storage.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthData {
    private String token;
    private String username;
    private String role;

    public static AuthData exceptionObject(String username) {
        return AuthData.builder().username(username).token("").role("").build();
    }
}
