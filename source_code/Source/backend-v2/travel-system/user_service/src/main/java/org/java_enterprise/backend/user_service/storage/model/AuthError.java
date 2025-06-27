package org.java_enterprise.backend.user_service.storage.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthError {
    private String email;
    private String username;
    private String password;
    private String otp;
    private String server;

    private String oldPassword;
    private String newPassword;
}
